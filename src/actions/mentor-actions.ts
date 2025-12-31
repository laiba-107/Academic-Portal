"use server";

import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/mail";
import { revalidatePath } from "next/cache";

export async function submitApplication(data: any) {
    try {
        // 1. Save application to Firestore
        await adminDb.collection("mentorApplications").add({
            ...data,
            status: "pending",
            createdAt: new Date().toISOString(),
        });

        // 2. Notify Admin (Email)
        // In a real app, fetch admin emails. Here hardcoded or env.
        const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
        await sendEmail(
            adminEmail,
            "New Mentor Application",
            `A new mentor application has been received from ${data.firstName} ${data.lastName}.`
        );

        revalidatePath("/admin/applications");
        return { success: true };
    } catch (error) {
        console.error("Submission failed:", error);
        return { success: false, error: "Failed to submit application" };
    }
}

export async function approveApplication(applicationId: string, uid: string, email: string) {
    try {
        // 1. Update Application Status
        await adminDb.collection("mentorApplications").doc(applicationId).update({
            status: "approved",
            updatedAt: new Date().toISOString(),
        });

        // 2. Set Custom Claim
        await adminAuth.setCustomUserClaims(uid, { role: "mentor" });

        // 3. Update User Document (for UI consistency if relying on doc)
        await adminDb.collection("users").doc(uid).update({
            role: "mentor",
        });

        // 4. Send Welcome Email
        await sendEmail(
            email,
            "Application Approved",
            "Congratulations! Your application to become a mentor has been approved.",
            "<p>Congratulations! Your application to become a mentor has been <strong>approved</strong>.</p><p>You can now access the Mentor Dashboard.</p>"
        );

        revalidatePath("/admin/applications");
        return { success: true };
    } catch (error) {
        console.error("Approval failed:", error);
        return { success: false, error: "Failed to approve application" };
    }
}

export async function rejectApplication(applicationId: string, email: string) {
    try {
        await adminDb.collection("mentorApplications").doc(applicationId).update({
            status: "rejected",
            updatedAt: new Date().toISOString(),
        });

        // Optional: Send Rejection Email
        await sendEmail(
            email,
            "Application Update",
            "Thank you for your interest. Unfortunately your application was not approved at this time."
        );

        revalidatePath("/admin/applications");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to reject application" };
    }
}
