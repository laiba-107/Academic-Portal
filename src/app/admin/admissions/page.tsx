import { adminDb } from "@/lib/firebase-admin";
import { AdmissionsClient } from "@/components/admin/admissions-client";

export const dynamic = "force-dynamic";

async function getAdmissions() {
    const snapshot = await adminDb.collection("admissions").orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export default async function AdminAdmissionsPage() {
    const admissions = await getAdmissions();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">Manage Admissions</h2>
                    <p className="text-muted-foreground">Create and manage admission opportunities.</p>
                </div>
            </div>
            <AdmissionsClient initialData={admissions} />
        </div>
    );
}
