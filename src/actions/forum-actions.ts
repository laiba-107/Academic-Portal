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

export async function deletePost(postId: string) {
    try {
        console.log("Admin attempting to delete post:", postId);
        // In a real production app, we would recursively delete replies too.
        // For simple Firestore, just deleting the doc is often enough if we only query main doc.
        // However, for clean data, we'll try to delete the subcollection if it exists (Firestore doesn't auto-delete subcollections)
        await adminDb.collection("discussions").doc(postId).delete();
        revalidatePath("/forum");
        return { success: true };
    } catch (error) {
        console.error("Error deleting post:", error);
        return { success: false, error: "Failed to delete post" };
    }
}

export async function deleteReply(threadId: string, replyId: string) {
    try {
        console.log("Admin attempting to delete reply:", replyId, "from thread:", threadId);
        const threadRef = adminDb.collection("discussions").doc(threadId);

        await adminDb.runTransaction(async (t: any) => {
            const threadDoc = await t.get(threadRef);
            if (!threadDoc.exists) throw new Error("Thread not found");

            t.delete(threadRef.collection("replies").doc(replyId));

            const currentCount = threadDoc.data()?.replyCount || 0;
            if (currentCount > 0) {
                t.update(threadRef, { replyCount: currentCount - 1 });
            }
        });

        revalidatePath("/forum");
        return { success: true };
    } catch (error) {
        console.error("Error deleting reply:", error);
        return { success: false, error: "Failed to delete reply" };
    }
}
