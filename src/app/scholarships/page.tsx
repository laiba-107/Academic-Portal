"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import ScholarshipGrid from "@/components/scholarship-grid";
import { Loader2 } from "lucide-react";

// Inline data fetching or using an API would be better, 
// but for now we'll simulate the protection on this page.

export default function ScholarshipsPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [scholarships, setScholarships] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            if (!u) {
                window.location.href = "/login";
            } else {
                setUser(u);
                setLoading(false);
            }
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (user) {
            // Fetch scholarships from a temporary internal API or existing logic
            // Since this was a server component, we need to adapt.
            fetch("/api/scholarships")
                .then(res => res.json())
                .then(data => {
                    setScholarships(data);
                    setFetching(false);
                })
                .catch(() => setFetching(false));
        }
    }, [user]);

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

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

                {fetching ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        <ScholarshipGrid scholarships={scholarships} />
                        {scholarships.length === 0 && (
                            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl bg-white/50 backdrop-blur-sm">
                                <h3 className="text-2xl font-semibold mb-2">No Scholarships Available</h3>
                                <p className="text-muted-foreground">Keep checking back! New opportunities are added weekly.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
