import { adminDb } from "@/lib/firebase-admin";
import UniversityGrid from "@/components/university-grid";

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

export default async function Home() {
  const admissions = await getAdmissions();

  return (
    <main
      className="min-h-[calc(100vh-64px)] w-full relative"
      style={{
        backgroundImage: `linear-gradient(rgba(240, 244, 248, 0.8), rgba(240, 244, 248, 0.8)), url('/background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="container py-12 relative z-10">
        <div className="mb-12 space-y-4 text-center">
          {motion_placeholder()}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary drop-shadow-sm">
            Future Starts Here
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover top-tier university programs and secure your academic career.
            Click on any university to explore requirements, fees, and departments.
          </p>
        </div>

        <UniversityGrid universities={admissions} />

        {admissions.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl bg-white/50 backdrop-blur-sm">
            <h3 className="text-2xl font-semibold mb-2">No Admissions Found</h3>
            <p className="text-muted-foreground">The admissions cycle hasn't started yet. Check back soon!</p>
          </div>
        )}
      </div>
    </main>
  );
}

// Simple helper to avoid import issues if motion is used in server components (which it shouldn't be, just making sure)
function motion_placeholder() { return null; }
