import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), '.gemini-model-cache.json');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const STRICT_CONFIG = {
    apiVersion: 'v1',
    model: 'models/gemini-2.0-flash',
    method: 'generateContent'
};

export type CacheStatus = 'HEALTHY' | 'DEGRADED' | 'EMPTY';

interface ModelCache {
    timestamp: number;
    models: string[];
    status: CacheStatus;
}

async function fetchAndCacheModels(apiKey: string): Promise<ModelCache> {
    try {
        const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch models: ${response.statusText}`);

        const data = await response.json();
        // Do NOT filter models incorrectly - cache all returned models
        const modelNames = data.models.map((m: any) => m.name);

        const cache: ModelCache = {
            timestamp: Date.now(),
            models: modelNames,
            status: 'HEALTHY'
        };

        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
        return cache;
    } catch (error) {
        console.error("❌ Gemini Discovery Error:", error);
        const degradedCache: ModelCache = {
            timestamp: Date.now(),
            models: [],
            status: 'DEGRADED'
        };
        // Don't overwrite healthy file with degraded data unless it's gone
        if (!fs.existsSync(CACHE_FILE)) {
            fs.writeFileSync(CACHE_FILE, JSON.stringify(degradedCache));
        }
        return degradedCache;
    }
}

export async function getModelCache(apiKey: string): Promise<ModelCache> {
    if (fs.existsSync(CACHE_FILE)) {
        try {
            const cache: ModelCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
            if (Date.now() - cache.timestamp < CACHE_DURATION) {
                return cache;
            }
        } catch (e) {
            console.error("❌ Error reading Gemini cache:", e);
        }
    }
    // If cache doesn't exist, is expired, or unreadable, fetch new models
    const fetchedCache = await fetchAndCacheModels(apiKey);
    if (fetchedCache.status === 'DEGRADED' && !fs.existsSync(CACHE_FILE)) {
        // If fetching failed and no cache file exists, create an EMPTY cache
        return { timestamp: Date.now(), models: [], status: 'EMPTY' };
    }
    return fetchedCache;
}

export function validateRequest(model: string, apiVersion: string, method: string, cache: ModelCache) {
    // 1. Never Block the Primary Model (Unconditional Approval)
    if (model === STRICT_CONFIG.model) {
        return true;
    }

    // 2. Strict validation for other models
    if (apiVersion !== 'v1') throw new Error(`Invalid API Version: ${apiVersion}`);
    if (method !== 'generateContent') throw new Error(`Invalid Method: ${method}`);

    // 3. Cache Validation Logic
    if (cache.status === 'HEALTHY' && !cache.models.includes(model)) {
        throw new Error(`Model ${model} not found in supported models cache.`);
    }

    // Advisory: If DEGRADED, we allow requests but log the state elsewhere
    return true;
}

export function logCacheStatus(cache: ModelCache) {
    console.log(JSON.stringify({
        cacheStatus: cache.status,
        cachedModelsCount: cache.models.length,
        primaryModelAllowed: true // Per user requirement, it's ALWAYS allowed
    }));
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
