import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
    try {
        const snapshot = await adminDb.collection("scholarships").orderBy("createdAt", "asc").get();
        const scholarships = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(scholarships);
    } catch (error) {
        console.error("Error fetching scholarships:", error);
        return NextResponse.json({ error: "Failed to fetch scholarships" }, { status: 500 });
    }
}
