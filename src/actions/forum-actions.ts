"use server";

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

export async function createPost(title: string, content: string, authorId: string, authorName: string, authorRole: string) {
    try {
        await adminDb.collection("discussions").add({
            title,
            content,
            authorId,
            authorName,
            authorRole,
            createdAt: new Date().toISOString(),
            likes: 0,
            replyCount: 0,
        });
        revalidatePath("/forum");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to create post" };
    }
}

export async function createReply(threadId: string, content: string, authorId: string, authorName: string, authorRole: string) {
    try {
        const threadRef = adminDb.collection("discussions").doc(threadId);

        // Transacton to add reply and increment count (optional, but good practice)
        await adminDb.runTransaction(async (t: any) => {
            const threadDoc = await t.get(threadRef);
            if (!threadDoc.exists) throw new Error("Thread not found");

            const newReplyRef = threadRef.collection("replies").doc();
            t.set(newReplyRef, {
                content,
                authorId,
                authorName,
                authorRole,
                createdAt: new Date().toISOString(),
                likes: 0
            });

            const currentCount = threadDoc.data()?.replyCount || 0;
            t.update(threadRef, { replyCount: currentCount + 1 });
        });

        revalidatePath("/forum"); // Not strictly needed for real-time client, but good for SEO or server cache
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to post reply" };
    }
}
