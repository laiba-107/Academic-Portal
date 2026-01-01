import { adminDb } from "@/lib/firebase-admin";
import ScholarshipGrid from "@/components/scholarship-grid";

export const dynamic = "force-dynamic";

async function getScholarships() {
    try {
        const snapshot = await adminDb.collection("scholarships").orderBy("createdAt", "asc").get();
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching scholarships:", error);
        return [];
    }
}

export default async function ScholarshipsPage() {
    const scholarships = await getScholarships();

    return (
        <main className="min-h-[calc(100vh-64px)] w-full py-12 bg-[#f8fafc]/50">
            <div className="container relative z-10">
                <div className="mb-12 space-y-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
                        Scholarship Portal
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Financial support should never be a barrier to your dreams.
                        Explore fully-funded local and international opportunities.
                    </p>
                </div>

                <ScholarshipGrid scholarships={scholarships} />

                {scholarships.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl bg-white/50 backdrop-blur-sm">
                        <h3 className="text-2xl font-semibold mb-2">No Scholarships Available</h3>
                        <p className="text-muted-foreground">Keep checking back! New opportunities are added weekly.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
