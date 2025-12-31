import { adminDb } from "@/lib/firebase-admin";
import { ScholarshipsClient } from "@/components/admin/scholarships-client";

export const dynamic = "force-dynamic";

async function getScholarships() {
    const snapshot = await adminDb.collection("scholarships").orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export default async function AdminScholarshipsPage() {
    const scholarships = await getScholarships();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">Manage Scholarships</h2>
                    <p className="text-muted-foreground">Update scholarship listings.</p>
                </div>
            </div>
            <ScholarshipsClient initialData={scholarships} />
        </div>
    );
}
