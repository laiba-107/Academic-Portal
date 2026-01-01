"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase"; // Ensure db is exported from here
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Loader2, User, Mail, Shield, GraduationCap } from "lucide-react";

export default function DashboardPage() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const [mentorApp, setMentorApp] = useState<any>(null);
    const [loadingApp, setLoadingApp] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function checkApplication() {
            if (user?.uid) {
                try {
                    const q = query(collection(db, "mentorApplications"), where("uid", "==", user.uid));
                    const snapshot = await getDocs(q);
                    if (!snapshot.empty) {
                        setMentorApp(snapshot.docs[0].data());
                    }
                } catch (e) {
                    console.error("Error fetching application", e);
                } finally {
                    setLoadingApp(false);
                }
            }
        }
        if (user) {
            checkApplication();
        }
    }, [user]);

    if (loading || (!user && !loading)) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container py-10 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Card */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">{(user as any).displayName || "User"}</h2>
                            <p className="text-sm text-muted-foreground">Student Account</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{user?.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <span>UID: {user?.uid.slice(0, 8)}...</span>
                        </div>
                    </div>
                </div>

                {/* Mentor Application Status */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            Mentor Status
                        </h2>
                    </div>

                    {loadingApp ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : mentorApp ? (
                        <div className="space-y-4">
                            <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${mentorApp.status === "approved" ? "bg-green-100 text-green-700" :
                                mentorApp.status === "rejected" ? "bg-red-100 text-red-700" :
                                    "bg-yellow-100 text-yellow-700"
                                }`}>
                                {mentorApp.status.charAt(0).toUpperCase() + mentorApp.status.slice(1)}
                            </div>

                            <div className="text-sm text-muted-foreground">
                                {mentorApp.status === "pending" && "Your application is currently under review."}
                                {mentorApp.status === "approved" && "Congratulations! You are now a mentor."}
                                {mentorApp.status === "rejected" && "Thank you for your interest. Unfortunately, your application was not approved at this time."}
                            </div>

                            <div className="text-sm">
                                <span className="text-muted-foreground">Applied on: </span>
                                {mentorApp.createdAt?.toDate ? mentorApp.createdAt.toDate().toLocaleDateString() : "Recent"}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-muted-foreground text-sm">
                                You haven't applied to be a mentor yet. Share your knowledge and help others succeed!
                            </p>
                            <button
                                onClick={() => router.push("/apply-mentor")}
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                Apply Now &rarr;
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
