import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            console.error("DEBUG: GEMINI_API_KEY is missing.");
            return NextResponse.json({ reply: "API Key is missing. Please check server settings." });
        }

        const apiKey = process.env.GEMINI_API_KEY.trim();
        const genAI = new GoogleGenerativeAI(apiKey);

        // 1. Fetch Admissions & Scholarships data for context
        const [admissionsSnap, scholarshipsSnap] = await Promise.all([
            adminDb.collection("admissions").get(),
            adminDb.collection("scholarships").get()
        ]);

        const admissions = admissionsSnap.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));
        const scholarships = scholarshipsSnap.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));

        // 2. Format Context for Gemini
        const context = `
AUTHORITATIVE DATA FROM OUR PORTAL:
UNIVERSITIES:
${admissions.map((u: any) => `- ${u.university} in ${u.location}. Program: ${u.program}. Fees: ${u.fees}. Requirements: ${u.requirements}. Deadline: ${u.deadline}. Website: ${u.website}`).join("\n")}

SCHOLARSHIPS:
${scholarships.map((s: any) => `- ${s.name} (${s.category}). Amount: ${s.amount}. Eligibility: ${s.eligibility}. Deadline: ${s.deadline}. Description: ${s.description}`).join("\n")}
`;

        // 3. Build System Instructions
        const systemPrompt = `
You are the "Academic Portal Assistant", a professional and helpful consultant for students seeking higher education and scholarships in Pakistan.

GUIDELINES:
1. Use the provided AUTHORITATIVE DATA as your primary source of truth.
2. If the information is NOT in the authoritative data, use your general knowledge.
3. Be conversational, encouraging, and precise.

CONTEXT:
${context}
`;

        // 4. Clean History (Ensure it starts with 'user')
        let cleanedHistory = history?.map((m: any) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }]
        })) || [];

        if (cleanedHistory.length > 0 && cleanedHistory[0].role === "model") {
            cleanedHistory.shift();
        }

        const finalMessage = cleanedHistory.length === 0
            ? `${systemPrompt}\n\nUSER QUESTION: ${message}`
            : message;

        // 5. Try Primary Model (Flash) with Fallback (Pro)
        let modelId = "gemini-1.5-flash";
        let result;

        try {
            const model = genAI.getGenerativeModel({ model: modelId });
            const chat = model.startChat({ history: cleanedHistory });
            result = await chat.sendMessage(finalMessage);
        } catch (firstError: any) {
            console.error("Primary Model Failed, trying fallback:", firstError.message);

            // Fallback to gemini-pro (Older but stable)
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
            const chat = fallbackModel.startChat({ history: cleanedHistory });
            result = await chat.sendMessage(finalMessage);
        }

        const reply = result.response.text();
        return NextResponse.json({ reply });
    } catch (error: any) {
        console.error("Chat API Error Detailed:", {
            message: error.message,
            stack: error.stack,
            response: error.response?.data
        });
        return NextResponse.json({
            reply: "I'm having trouble connecting to my AI brain right now. Please try again in a moment!"
        });
    }
}
