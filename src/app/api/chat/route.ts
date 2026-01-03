import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ reply: "API Key is missing. Please check server settings." });
        }

        // 1. Fetch Local context
        const [admissionsSnap, scholarshipsSnap] = await Promise.all([
            adminDb.collection("admissions").get(),
            adminDb.collection("scholarships").get()
        ]);

        const context = `
AUTHORITATIVE PORTAL DATA (Primary source for specific fees and deadlines):
UNIVERSITIES:
${admissionsSnap.docs.map((u: any) => `- ${u.data().university} in ${u.data().location}. Fees: ${u.data().fees}`).join("\n")}
SCHOLARSHIPS:
${scholarshipsSnap.docs.map((s: any) => `- ${s.data().name} (${s.data().category})`).join("\n")}
`;

        // 2. Direct REST API Call (Avoids library 404s on Render)
        const apiKey = process.env.GEMINI_API_KEY.trim();
        // Using v1 for stable model support
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const systemPrompt = `You are the Academic Portal Assistant.
1. Use the AUTHORITATIVE DATA for specific questions about universities in our database.
2. FOR ANYTHING ELSE, use your general knowledge, recent web-scale training data, and expertise to provide high-quality, comprehensive answers about any university or scholarship worldwide.
3. Act as if you have access to real-time information. Provide dates, rankings, and detailed comparisons.
4. Be professional, encouraging, and precise.`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `${systemPrompt}\n\nCONTEXT:\n${context}\n\nUSER QUESTION: ${message}\n\n(Note: If history exists, treat this as a continuation)`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini REST API Error:", data);
            return NextResponse.json({
                reply: `AI CONNECTION ERROR (${response.status}): ${data.error?.message || "Check your API key settings."}`
            });
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";

        return NextResponse.json({ reply });

    } catch (error: any) {
        console.error("Critical Chat Error:", error);
        return NextResponse.json({ reply: `ERROR: ${error.message}` });
    }
}
