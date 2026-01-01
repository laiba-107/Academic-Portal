"use server";

import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

export async function createAdmission(data: any) {
    try {
        const docRef = await adminDb.collection("admissions").add({
            ...data,
            createdAt: new Date().toISOString(),
        });
        revalidatePath("/admissions");
        revalidatePath("/admin");
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating admission:", error);
        return { success: false, error: "Failed to create admission" };
    }
}

export async function updateAdmission(id: string, data: any) {
    try {
        await adminDb.collection("admissions").doc(id).update({
            ...data,
            updatedAt: new Date().toISOString(),
        });
        revalidatePath("/admissions");
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update admission" };
    }
}

export async function deleteAdmission(id: string) {
    try {
        await adminDb.collection("admissions").doc(id).delete();
        revalidatePath("/admissions");
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete admission" };
    }
}

export async function createScholarship(data: any) {
    try {
        const docRef = await adminDb.collection("scholarships").add({
            ...data,
            createdAt: new Date().toISOString(),
        });
        revalidatePath("/scholarships");
        revalidatePath("/admin");
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: "Failed to create scholarship" };
    }
}

export async function deleteScholarship(id: string) {
    try {
        await adminDb.collection("scholarships").doc(id).delete();
        revalidatePath("/scholarships");
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete scholarship" };
    }
}

export async function approveApplication(applicationId: string, uid: string) {
    try {
        await adminDb.collection("mentorApplications").doc(applicationId).update({
            status: "approved",
            updatedAt: new Date().toISOString(),
        });

        // Grant mentor role
        await adminAuth.setCustomUserClaims(uid, { role: "mentor" });

        revalidatePath("/admin/applications");
        return { success: true };
    } catch (error) {
        console.error("Error approving application:", error);
        return { success: false, error: "Failed to approve application" };
    }
}

export async function rejectApplication(applicationId: string) {
    try {
        await adminDb.collection("mentorApplications").doc(applicationId).update({
            status: "rejected",
            updatedAt: new Date().toISOString(),
        });
        revalidatePath("/admin/applications");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to reject application" };
    }
}
