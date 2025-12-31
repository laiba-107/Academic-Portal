import { adminDb } from "@/lib/firebase-admin";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

async function getAdmissions() {
    const snapshot = await adminDb.collection("admissions").orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export default async function AdmissionsPage() {
    const admissions = await getAdmissions();

    return (
        <div className="container py-8">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold text-primary">Admissions Open</h1>
                <p className="text-muted-foreground">
                    Explore top university programs and opportunities.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {admissions.map((item: any) => (
                    <div
                        key={item.id}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                                {item.university || "University Name"}
                            </h3>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p><span className="font-medium text-foreground">Program:</span> {item.program || "Program Name"}</p>
                                <p><span className="font-medium text-foreground">Location:</span> {item.country || "Country"}</p>
                                <p><span className="font-medium text-foreground">Deadline:</span> {item.deadline || "TBA"}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {admissions.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        No admission opportunities found at this time.
                    </div>
                )}
            </div>
        </div>
    );
}
