"use server";

import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function createProfile(idToken: string, nickname: string, requestedRole: string = "user", adminCode?: string) {
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const email = decodedToken.email;

        let roleToSet = "user";

        if (requestedRole === "admin") {
            const masterCode = process.env.ADMIN_SECRET_CODE || "admin123"; // Fallback for safety during setup
            if (adminCode !== masterCode) {
                return { success: false, error: "Invalid Admin Secret Code" };
            }
            roleToSet = "admin";
        }

        // If they sign up as mentor, they start as 'user' but we create an application
        if (requestedRole === "mentor") {
            await adminDb.collection("mentorApplications").add({
                uid,
                email,
                firstName: nickname,
                lastName: "", // Will be filled later or just use nickname
                expertise: "General",
                experience: "New Applicant",
                status: "pending",
                createdAt: new Date().toISOString(),
            });
        }

        // Set custom claim
        await adminAuth.setCustomUserClaims(uid, { role: roleToSet });

        // Create user document in Firestore
        await adminDb.collection("users").doc(uid).set({
            uid,
            email,
            nickname,
            role: roleToSet,
            requestedRole: requestedRole,
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
