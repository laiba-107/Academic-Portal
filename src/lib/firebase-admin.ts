import * as admin from "firebase-admin";

if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey: privateKey.replace(/\\n/g, "\n"),
            }),
        });
    } else {
        console.warn("⚠️ Firebase Admin credentials missing. Using mock implementation for build/dev.");
    }
}

// Safe getters to prevent crash during build
const getAuth = () => {
    if (admin.apps.length) return admin.auth();
    return {
        verifyIdToken: async () => ({ uid: "mock", role: "user" }),
        setCustomUserClaims: async () => { },
        getUser: async () => ({}),
    } as any;
}

const getDb = () => {
    if (admin.apps.length) return admin.firestore();
    return {
        collection: (name: string) => ({
            doc: (path: string) => ({
                get: async () => ({ exists: false, data: () => ({}) }),
                set: async () => { },
                update: async () => { },
                delete: async () => { },
                collection: () => ({ doc: () => ({ set: async () => { } }) })
            }),
            add: async () => ({ id: "mock-id" }),
            where: () => ({ orderBy: () => ({ get: async () => ({ docs: [] }) }), get: async () => ({ docs: [] }) }),
            orderBy: () => ({ get: async () => ({ docs: [] }) }),
            get: async () => ({ docs: [] })
        }),
        runTransaction: async (cb: any) => cb({ get: async () => ({ exists: false }), set: () => { }, update: () => { } }),
    } as any;
}

export const adminAuth = getAuth();
export const adminDb = getDb();
