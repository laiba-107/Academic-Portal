import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

async function getScholarships() {
    try {
        const snapshot = await adminDb.collection("scholarships").orderBy("createdAt", "desc").get();
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching scholarships:", error);
        return [];
    }
}

export default async function ScholarshipsPage() {
    const scholarships = await getScholarships();

    return (
        <div className="container py-8">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold text-primary">Scholarships</h1>
                <p className="text-muted-foreground">
                    Find financial aid and scholarship opportunities.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {scholarships.map((item: any) => (
                    <div
                        key={item.id}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                                {item.name || "Scholarship Name"}
                            </h3>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p><span className="font-medium text-foreground">Amount:</span> {item.amount || "Variable"}</p>
                                <p><span className="font-medium text-foreground">Eligibility:</span> {item.eligibility || "Open"}</p>
                                <p><span className="font-medium text-foreground">Deadline:</span> {item.deadline || "TBA"}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {scholarships.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        No scholarships found at this time.
                    </div>
                )}
            </div>
        </div>
    );
}
