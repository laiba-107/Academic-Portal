import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { STRICT_CONFIG, validateRequest, logGeminiRequest, getValidatedModels } from "@/lib/gemini";

export async function POST(req: Request) {
    const timestamp = new Date().toISOString();
    let scrapeStatus = "success";

    try {
        const { message, history } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            console.error("API Key is missing.");
            return NextResponse.json({ reply: "Server configuration error." });
        }

        const apiKey = process.env.GEMINI_API_KEY.trim();

        // 1. Mandatory Pre-Request Validation
        try {
            validateRequest(STRICT_CONFIG);
        } catch (vError: any) {
            logGeminiRequest(STRICT_CONFIG.model, STRICT_CONFIG.apiVersion, "direct", `VALIDATION_FAILED: ${vError.message}`);
            return NextResponse.json({ reply: "Invalid API Configuration. Request blocked." });
        }

        // 2. Model Discovery & Caching Check
        const supportedModels = await getValidatedModels(apiKey);
        if (supportedModels.length > 0 && !supportedModels.includes(STRICT_CONFIG.model)) {
            logGeminiRequest(STRICT_CONFIG.model, STRICT_CONFIG.apiVersion, "direct", "MODEL_NOT_IN_CACHE");
            return NextResponse.json({ reply: "Requested model not supported by your API key." });
        }

        // 3. Fetch Local context (The "Scraping" equivalent for this route)
        const [admissionsSnap, scholarshipsSnap] = await Promise.all([
            adminDb.collection("admissions").get(),
            adminDb.collection("scholarships").get()
        ]);

        const context = `
AUTHORITATIVE PORTAL DATA:
UNIVERSITIES:
${admissionsSnap.docs.map((u: any) => `- ${u.data().university} in ${u.data().location}.`).join("\n")}
SCHOLARSHIPS:
${scholarshipsSnap.docs.map((s: any) => `- ${s.data().name}`).join("\n")}
`;

        // 4. Web Scraping Guardrails (Abort if empty or malformed)
        // Note: Even if Firestore is empty, we have system prompt, but if message is missing, abort.
        if (!message || message.trim().length === 0) {
            scrapeStatus = "failed_empty_input";
            logGeminiRequest(STRICT_CONFIG.model, STRICT_CONFIG.apiVersion, "direct", "ABORTED_EMPTY_INPUT");
            return NextResponse.json({ reply: "Please provide a valid question." });
        }

        const systemPrompt = `You are the Academic Portal Assistant.
1. Use the AUTHORITATIVE DATA...`;

        const apiRequest = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nCONTEXT:\n${context}\n\nUSER QUESTION: ${message}` }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
            })
        };

        const url = `https://generativelanguage.googleapis.com/${STRICT_CONFIG.apiVersion}/${STRICT_CONFIG.model}:${STRICT_CONFIG.method}?key=${apiKey}`;

        // Mandatory Logging before request
        logGeminiRequest(STRICT_CONFIG.model, STRICT_CONFIG.apiVersion, "direct", "PENDING");

        let response = await fetch(url, apiRequest);

        // 5. Retry Rules (Retry once on the same model/version)
        if (!response.ok && response.status !== 404) {
            console.warn(`Gemini Request failed (${response.status}). Retrying once...`);
            response = await fetch(url, apiRequest);
        }

        // Handle 404 specifically as per instructions
        if (response.status === 404) {
            console.error("404 Error: Forcing model and refreshing cache...");
            await getValidatedModels(apiKey); // Refresh cache
            // Force retry once same config
            response = await fetch(url, apiRequest);
        }

        const data = await response.json();

        if (!response.ok) {
            logGeminiRequest(STRICT_CONFIG.model, STRICT_CONFIG.apiVersion, "direct", `ERROR_${response.status}`);
            return NextResponse.json({ reply: `AI Connection Error (${response.status})` });
        }

        logGeminiRequest(STRICT_CONFIG.model, STRICT_CONFIG.apiVersion, "direct", "SUCCESS");
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

        return NextResponse.json({ reply });

    } catch (error: any) {
        console.error("Critical Chat Error:", error);
        logGeminiRequest(STRICT_CONFIG.model, STRICT_CONFIG.apiVersion, "direct", "CRITICAL_FAILURE");
        return NextResponse.json({ reply: "Internal Server Error." });
    }
}
