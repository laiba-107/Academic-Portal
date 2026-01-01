"use server";

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

export async function createPost(title: string, content: string, authorId: string, authorName: string, authorRole: string) {
    try {
        console.log("Attempting to create post:", { title, authorId, authorName });
        const docRef = await adminDb.collection("discussions").add({
            title,
            content,
            authorId,
            authorName,
            authorRole,
            createdAt: new Date().toISOString(),
            likes: 0,
            replyCount: 0,
        });
        console.log("Post created successfully with ID:", docRef.id);
        revalidatePath("/forum");
        return { success: true };
    } catch (error) {
        console.error("CRITICAL ERROR: Failed to create forum post:", error);
        return { success: false, error: "Failed to create post. Check server logs." };
    }
}

export async function createReply(threadId: string, content: string, authorId: string, authorName: string, authorRole: string) {
    try {
        console.log("Attempting to post reply to:", threadId, "by:", authorId);
        const threadRef = adminDb.collection("discussions").doc(threadId);

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

        console.log("Reply posted successfully to thread:", threadId);
        revalidatePath("/forum");
        return { success: true };
    } catch (error) {
        console.error("CRITICAL ERROR: Failed to post reply:", error);
        return { success: false, error: "Failed to post reply. Check server logs." };
    }
}
