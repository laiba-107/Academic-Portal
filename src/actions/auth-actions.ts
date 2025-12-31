"use server";

import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function createProfile(idToken: string, nickname: string) {
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const email = decodedToken.email;

        // Set custom claim 'role: user'
        await adminAuth.setCustomUserClaims(uid, { role: "user" });

        // Create user document in Firestore
        await adminDb.collection("users").doc(uid).set({
            uid,
            email,
            nickname,
            role: "user",
            createdAt: new Date().toISOString(),
        });

        return { success: true };
    } catch (error) {
        console.error("Error creating profile:", error);
        return { success: false, error: "Failed to create profile" };
    }
}

export async function checkRole(idToken: string, requiredRole: string) {
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        if (decodedToken.role === requiredRole) return true;
        return false;
    } catch (e) {
        return false;
    }
}
