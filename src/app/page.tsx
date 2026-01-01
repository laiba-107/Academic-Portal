import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

async function getAdmissions() {
  try {
    const snapshot = await adminDb.collection("admissions").orderBy("createdAt", "desc").get();
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
        backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.85), rgba(248, 250, 252, 0.85)), url('/background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="container py-12 relative z-10">
        <div className="mb-10 space-y-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">
            University Admissions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore top university programs and opportunities from around the world.
            Login to access our Community Forum and Scholarship opportunities.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {admissions.map((item: any) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card/90 backdrop-blur-sm p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
            >
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl mb-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {item.university?.charAt(0) || "U"}
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {item.university || "University Name"}
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold text-foreground min-w-[70px]">Program:</span>
                    {item.program || "Program Name"}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold text-foreground min-w-[70px]">Location:</span>
                    {item.country || "Country"}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold text-foreground min-w-[70px]">Deadline:</span>
                    {item.deadline || "TBA"}
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <span className="text-xs font-medium text-primary uppercase tracking-wider">
                  Admissions Open
                </span>
              </div>
            </div>
          ))}

          {admissions.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl bg-muted/20">
              <h3 className="text-xl font-semibold mb-2">No Admissions Found</h3>
              <p className="text-muted-foreground">Check back later for new university opportunities.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
