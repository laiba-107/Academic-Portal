import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { STRICT_CONFIG, validateRequest, logGeminiRequest, getModelCache, logCacheStatus } from "@/lib/gemini";
import { scrapeUniversityPage, extractRelevantSections } from "@/lib/scraper";

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

        // 1. Model Discovery & Caching
        const cache = await getModelCache(apiKey);
        logCacheStatus(cache);

        // 2. Mandatory Pre-Request Validation
        try {
            validateRequest(STRICT_CONFIG.model, STRICT_CONFIG.apiVersion, STRICT_CONFIG.method, cache);
        } catch (vError: any) {
            logGeminiRequest(STRICT_CONFIG.model, STRICT_CONFIG.apiVersion, "direct", `VALIDATION_FAILED: ${vError.message}`);
            return NextResponse.json({ reply: "Invalid API Configuration. Request blocked." });
        }

        // 3. Fetch Local Context from Firestore
        const [admissionsSnap, scholarshipsSnap] = await Promise.all([
            adminDb.collection("admissions").get(),
            adminDb.collection("scholarships").get()
        ]);

        const universities = admissionsSnap.docs.map((doc: any) => doc.data());
        const scholarships = scholarshipsSnap.docs.map((doc: any) => doc.data());

        // Build local context
        let localContext = `
AUTHORITATIVE PORTAL DATA:

UNIVERSITIES (${universities.length} total):
${universities.map((u: any) => `
- ${u.university} (${u.location})
  Type: ${u.type}
  Website: ${u.website}
  Fees: ${u.fees}
  Requirements: ${u.requirements}
  Famous Departments: ${u.famousDepartments?.join(', ')}
  Deadline: ${u.deadline}
`).join('\n')}

SCHOLARSHIPS (${scholarships.length} total):
${scholarships.map((s: any) => `
- ${s.name}
  Category: ${s.category}
  Amount: ${s.amount}
  Eligibility: ${s.eligibility}
  Deadline: ${s.deadline}
  Link: ${s.link}
`).join('\n')}
`;

        // 4. Intelligent Query Routing - Determine if web scraping is needed
        const needsWebScraping = detectWebScrapingNeed(message, universities);
        let scrapedContext = "";
        let scrapedSources: string[] = [];

        if (needsWebScraping.needed) {
            console.log(`[Chat] Web scraping triggered for: ${needsWebScraping.urls.join(', ')}`);

            // Attempt to scrape relevant URLs
            for (const url of needsWebScraping.urls.slice(0, 2)) { // Limit to 2 URLs to avoid slowness
                const scraped = await scrapeUniversityPage(url);
                if (scraped) {
                    const relevantContent = extractRelevantSections(scraped, message);
                    scrapedContext += `\n\nWEB SCRAPED DATA from ${scraped.title} (${scraped.url}):\n${relevantContent}\n`;
                    scrapedSources.push(scraped.url);
                }
            }
        }

        // 5. Validate input
        if (!message || message.trim().length === 0) {
            scrapeStatus = "failed_empty_input";
            logGeminiRequest(STRICT_CONFIG.model, STRICT_CONFIG.apiVersion, "direct", "ABORTED_EMPTY_INPUT");
            return NextResponse.json({ reply: "Please provide a valid question." });
        }

        // 6. Build Enhanced System Prompt
        const systemPrompt = `You are the Academic Portal Assistant - an intelligent AI helper for Pakistani students seeking university admissions and scholarship information.

YOUR CAPABILITIES:
1. Access to authoritative database of ${universities.length} universities and ${scholarships.length} scholarships
2. Real-time web scraping of university websites for latest information
3. General knowledge about Pakistani education system, entrance tests, and application processes

RESPONSE GUIDELINES:
- Always prioritize AUTHORITATIVE PORTAL DATA (from our database) as it's verified
- Use WEB SCRAPED DATA when available for the most current information
- For general questions (study tips, test prep, career advice), use your knowledge
- Be specific, helpful, and cite sources when using scraped data
- If you don't have enough information, acknowledge it honestly
- Include relevant deadlines, fees, and requirements when discussing universities

FORMATTING REQUIREMENTS (IMPORTANT):
- Use **bold text** for important information like university names, fees, deadlines, and key requirements
- Use bullet points (•) or numbered lists for multiple items
- Use proper headings (##) when organizing complex information
- Format links as [text](url) when providing website references
- Keep responses well-structured and easy to scan
- Use line breaks to separate different topics

EXAMPLE FORMATTING:
**NUST Engineering Admission**

**Requirements:**
• Minimum 60-75% in FSc/Equivalent
• NUST Entry Test (NET) required

**Fees:** ~PKR 120,000-150,000 per semester

**Deadline:** July 2025

IMPORTANT:
- Always mention if information is from our database vs. scraped from university websites
- If scraped data is used, mention the source URL
- For scholarship questions, provide direct application links when available
- Be encouraging and supportive - students are often stressed about admissions`;

        // 7. Prepare AI Request
        const fullContext = `${systemPrompt}

${localContext}
${scrapedContext}

${scrapedSources.length > 0 ? `\nSOURCES CONSULTED: ${scrapedSources.join(', ')}` : ''}

USER QUESTION: ${message}`;

        const apiRequest = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: fullContext }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2000, // Increased for more detailed responses
                    topP: 0.9,
                    topK: 40
                }
            })
        };

        const url = `https://generativelanguage.googleapis.com/${STRICT_CONFIG.apiVersion}/${STRICT_CONFIG.model}:${STRICT_CONFIG.method}?key=${apiKey}`;

        // 8. Make AI Request
        logGeminiRequest(STRICT_CONFIG.model, STRICT_CONFIG.apiVersion, "direct", "PENDING");

        let response = await fetch(url, apiRequest);

        // 9. Retry Logic
        if (!response.ok && response.status !== 404) {
            console.warn(`Gemini Request failed (${response.status}). Retrying once...`);
            response = await fetch(url, apiRequest);
        }

        if (response.status === 404) {
            console.error("404 Error: Forcing model and refreshing cache...");
            await getModelCache(apiKey);
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
        return NextResponse.json({ reply: "Internal Server Error. Please try again." });
    }
}

/**
 * Determines if a query needs web scraping and returns relevant URLs
 */
function detectWebScrapingNeed(query: string, universities: any[]): { needed: boolean; urls: string[] } {
    const queryLower = query.toLowerCase();

    // Keywords that suggest need for current/detailed information
    const scrapingKeywords = [
        'latest', 'current', 'updated', 'recent', 'new',
        'detailed', 'specific', 'exact', 'precise',
        'admission process', 'how to apply', 'application procedure',
        'entry test', 'test pattern', 'syllabus'
    ];

    const needsScraping = scrapingKeywords.some(keyword => queryLower.includes(keyword));

    if (!needsScraping) {
        return { needed: false, urls: [] };
    }

    // Find relevant university URLs
    const relevantUrls: string[] = [];

    for (const uni of universities) {
        const uniName = uni.university.toLowerCase();
        const uniShortNames = [
            'nust', 'lums', 'aku', 'iba', 'comsats', 'fast',
            'giki', 'ned', 'numl', 'uet', 'habib', 'qau', 'pieas'
        ];

        // Check if query mentions this university
        const mentioned = uniShortNames.some(short =>
            queryLower.includes(short) && uniName.includes(short)
        ) || queryLower.includes(uniName);

        if (mentioned && uni.website) {
            relevantUrls.push(uni.website);
        }
    }

    return {
        needed: relevantUrls.length > 0,
        urls: relevantUrls
    };
}
