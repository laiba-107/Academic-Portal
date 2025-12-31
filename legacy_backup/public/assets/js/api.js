import { auth } from './firebase-init.js';

const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : ''; // In production (Render), same origin if proxied or separate URL if different.
// If served from same domain (e.g. valid static site + api), or if we use relative path.
// However, Static Site and Web Service are different on Render.
// We might need an env var or a hardcoded URL.
// For now, let's assume relative path /api if we serve frontend from express,
// BUT we are keeping them separate (Static Site + Web Service).
// So we need the Web Service URL.
// We can make this configurable. For now, let's just use relative and assume we might serve static files from express too?
// Wait, the plan was Option B: "Consolidated on Render".
// If "Full Migration", commonly one Express app serves both API and Static files.
// or 2 services.
// If 2 services, we need the URL.
// Let's assume for this implementation we might serve static files from the Express app too for simplicity?
// Actually, "Static Site" on Render is free/cheap. Web Service is separate.
// Let's implement this to detect if it's local or production.
// PRO TIP: On Render, we can set a global var or just use a known URL.
// Let's try to use a relative path `/api` and have the Express app serve the static files?
// That is indeed "Consolidated". The previous plan said "Static Site" + "Backend Service".
// If they are separate domains, we need CORS. The backend has CORS enabled.
// The frontend needs the backend URL.
// Let's use a placeholder we can swap, or logical deduction.

const getBackendUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }
    // In production, users should set this. 
    // Or we can assume a specific convention.
    // Let's hardcode the Render service URL placeholder.
    return 'https://student-portal-api.onrender.com';
};

export const apiFetch = async (endpoint, options = {}) => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
    };

    const baseUrl = getBackendUrl();
    const res = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || res.statusText);
    }

    return res.json();
};
