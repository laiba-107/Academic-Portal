import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), '.gemini-model-cache.json');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const STRICT_CONFIG = {
    apiVersion: 'v1',
    model: 'models/gemini-1.5-flash',
    method: 'generateContent'
};

async function fetchAndCacheModels(apiKey: string) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch models: ${response.statusText}`);

        const data = await response.json();
        const cache = {
            timestamp: Date.now(),
            models: data.models.map((m: any) => m.name)
        };

        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
        return cache.models;
    } catch (error) {
        console.error("❌ Gemini Cache Error:", error);
        return [];
    }
}

export async function getValidatedModels(apiKey: string): Promise<string[]> {
    if (fs.existsSync(CACHE_FILE)) {
        const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
        if (Date.now() - cache.timestamp < CACHE_DURATION) {
            return cache.models;
        }
    }
    return await fetchAndCacheModels(apiKey);
}

export function validateRequest(config: typeof STRICT_CONFIG) {
    if (config.apiVersion !== 'v1') throw new Error(`Invalid API Version: ${config.apiVersion}`);
    if (config.model !== 'models/gemini-1.5-flash') throw new Error(`Invalid Model: ${config.model}`);
    if (config.method !== 'generateContent') throw new Error(`Invalid Method: ${config.method}`);
}

export function logGeminiRequest(model: string, version: string, source: string, status: string) {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        model,
        apiVersion: version,
        source,
        status
    }));
}
