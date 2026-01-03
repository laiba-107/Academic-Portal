const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");
const fetch = require("node-fetch");
require("dotenv").config({ path: ".env.local" });

// Initialize Firebase
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function scrapeAndSeed(url) {
    console.log(`🚀 Starting scrape for: ${url}`);

    try {
        // 1. Fetch Page Content
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }
        const html = await response.text();

        // Simple text extraction (strip tags)
        const text = html.replace(/<[^>]*>?/gm, ' ').trim().substring(0, 15000);

        // Guardrail: Abort if content is empty
        if (!text || text.length < 50) {
            console.error("🛑 ABORTING: Scraped content is empty or too short. Valid data cannot be extracted.");
            return;
        }

        // 2. Use Gemini to Parse Data
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // STRICT ENFORCEMENT: API v1 (implicit in library) and models/gemini-1.5-flash
        const modelName = "models/gemini-1.5-flash";
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `
Extract university admission data from the following text and return it as a JSON object.
Fields needed: university, location, fees, requirements, deadline, website, programs, type (Private/Public).

TEXT:
${text}

JSON FORMAT:
{
  "university": "Name",
  "location": "City",
  "fees": "Fee structure",
  "requirements": "Admission criteria",
  "deadline": "Date",
  "website": "${url}",
  "programs": "List of programs",
  "type": "Public/Private"
}
`;

        // Mandatory Logging
        console.log(`[${new Date().toISOString()}] AI Request: Model=${modelName}, Source=Scraped content from ${url}`);

        console.log("🤖 Asking AI to parse data...");
        const result = await model.generateContent(prompt);
        const jsonText = result.response.text().replace(/```json|```/g, "").trim();
        const data = JSON.parse(jsonText);

        // 3. Save to Firestore
        console.log("💾 Saving to database...");
        await db.collection("admissions").add({
            ...data,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            image: "/images/placeholder-uni.jpg" // Default placeholder
        });

        console.log(`✅ [${new Date().toISOString()}] Successfully scraped and seeded: ${data.university}`);
    } catch (error) {
        console.error("❌ Scraping failed:", error.message);
    }
}

const targetUrl = process.argv[2];
if (!targetUrl) {
    console.log("Usage: node scripts/scrape-and-seed.js <URL>");
} else {
    scrapeAndSeed(targetUrl);
}
