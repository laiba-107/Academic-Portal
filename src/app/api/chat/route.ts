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

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
1. Use the provided AUTHORITATIVE DATA as your primary source of truth. If a user asks about a specific university or scholarship in this list, quote these details accurately.
2. If the information is NOT in the authoritative data, use your general knowledge of Pakistani and international universities to provide a helpful, comprehensive answer.
3. If a user asks for comparisons (e.g. NUST vs LUMS), provide a detailed breakdown based on rankings, fees, and programs.
4. If a user asks about "web scraping" or "latest updates", explain that you have access to a vast database of academic information up to your last training and the portal's current records.
5. Be conversational, encouraging, and precise.
6. Always suggest checking the official websites mentioned in the data for the absolute latest updates.

CONTEXT:
${context}
`;

        // 3. Prepare Model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 4. Clean History (Ensure it starts with 'user')
        let cleanedHistory = history?.map((m: any) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }]
        })) || [];

        // In Gemini, history MUST start with 'user'
        if (cleanedHistory.length > 0 && cleanedHistory[0].role === "model") {
            cleanedHistory.shift();
        }

        const chat = model.startChat({
            history: cleanedHistory,
        });

        // Prepend system prompt to the first message if history is empty to set context
        const finalMessage = cleanedHistory.length === 0
            ? `${systemPrompt}\n\nUSER QUESTION: ${message}`
            : message;

        const result = await chat.sendMessage(finalMessage);
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
