import { adminDb } from "@/lib/firebase-admin";
import UniversityGrid from "@/components/university-grid";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function getAdmissions() {
    try {
        const snapshot = await adminDb.collection("admissions").orderBy("createdAt", "asc").get();
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching admissions:", error);
        return [];
    }
}

export default async function AdmissionsPage() {
    // Simple check for existence of auth token in cookies (Next.js server-side protection)
    // In a real app, you'd verify the token with Firebase Admin
    const authCookie = (await cookies()).get("__session");

    // Note: For now, we'll rely on client-side protection in Navbar, 
    // but this is how you'd start server-side protection.
    // if (!authCookie) redirect("/login");

    const admissions = await getAdmissions();

    return (
        <main className="min-h-[calc(100vh-64px)] w-full py-12 bg-[#f0f9ff]">
            <div className="container relative z-10 px-4 md:px-6">
                <div className="mb-12 space-y-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary drop-shadow-sm">
                        University Admissions 2025
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Detailed information on admissions, requirements, and direct application links for top universities.
                    </p>
                </div>

                <UniversityGrid universities={admissions} />

                {admissions.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl bg-white/50 backdrop-blur-sm">
                        <h3 className="text-2xl font-semibold mb-2">No Admissions Data Found</h3>
                        <p className="text-muted-foreground">We're currently updating the 2025 admissions list. Please check back soon!</p>
                    </div>
                )}
            </div>
        </main>
    );
}
