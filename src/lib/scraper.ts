import { LRUCache } from 'lru-cache';
import * as cheerio from 'cheerio';

// Cache for scraped content (max 100 entries, 1 hour TTL)
const scrapeCache = new LRUCache<string, ScrapedContent>({
    max: 100,
    ttl: 1000 * 60 * 60, // 1 hour
});

interface ScrapedContent {
    url: string;
    text: string;
    title: string;
    scrapedAt: Date;
}

/**
 * Scrapes a university webpage and extracts relevant text content
 */
export async function scrapeUniversityPage(url: string): Promise<ScrapedContent | null> {
    // Check cache first
    const cached = scrapeCache.get(url);
    if (cached) {
        console.log(`[Scraper] Cache hit for ${url}`);
        return cached;
    }

    try {
        console.log(`[Scraper] Fetching ${url}`);

        // Fetch the page with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error(`[Scraper] HTTP error ${response.status} for ${url}`);
            return null;
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove script, style, and other non-content elements
        $('script, style, nav, footer, header, iframe, noscript').remove();

        // Extract title
        const title = $('title').text().trim() || $('h1').first().text().trim();

        // Extract main content - prioritize main content areas
        let text = '';
        const contentSelectors = [
            'main',
            'article',
            '.content',
            '#content',
            '.main-content',
            'body'
        ];

        for (const selector of contentSelectors) {
            const content = $(selector).text();
            if (content && content.length > 200) {
                text = content;
                break;
            }
        }

        // Fallback to body if no main content found
        if (!text) {
            text = $('body').text();
        }

        // Clean up the text
        text = text
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
            .trim()
            .substring(0, 5000); // Limit to 5000 characters

        const scrapedContent: ScrapedContent = {
            url,
            text,
            title,
            scrapedAt: new Date()
        };

        // Cache the result
        scrapeCache.set(url, scrapedContent);
        console.log(`[Scraper] Successfully scraped ${url} (${text.length} chars)`);

        return scrapedContent;

    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error(`[Scraper] Timeout scraping ${url}`);
        } else {
            console.error(`[Scraper] Error scraping ${url}:`, error.message);
        }
        return null;
    }
}

/**
 * Attempts to scrape multiple URLs and returns the first successful result
 */
export async function scrapeMultipleUrls(urls: string[]): Promise<ScrapedContent | null> {
    for (const url of urls) {
        const result = await scrapeUniversityPage(url);
        if (result) {
            return result;
        }
    }
    return null;
}

/**
 * Extracts relevant information from scraped content based on query
 * This is a simple keyword-based extraction - the AI will do the heavy lifting
 */
export function extractRelevantSections(content: ScrapedContent, query: string): string {
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(' ').filter(w => w.length > 3);

    // Split content into paragraphs
    const paragraphs = content.text.split('\n').filter(p => p.trim().length > 50);

    // Score paragraphs based on keyword matches
    const scoredParagraphs = paragraphs.map(para => {
        const paraLower = para.toLowerCase();
        const score = keywords.reduce((acc, keyword) => {
            return acc + (paraLower.includes(keyword) ? 1 : 0);
        }, 0);
        return { para, score };
    });

    // Get top 5 most relevant paragraphs
    const relevant = scoredParagraphs
        .filter(p => p.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(p => p.para)
        .join('\n\n');

    return relevant || content.text.substring(0, 2000);
}

/**
 * Clears the scrape cache (useful for testing or forced refresh)
 */
export function clearScrapeCache() {
    scrapeCache.clear();
    console.log('[Scraper] Cache cleared');
}
