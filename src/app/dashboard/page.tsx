"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase"; // Ensure db is exported from here
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Loader2, User, Mail, Shield, GraduationCap, MessageSquare, ExternalLink, Sparkles } from "lucide-react";

export default function DashboardPage() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const [userRole, setUserRole] = useState("user");

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function fetchRole() {
            if (user) {
                const token = await user.getIdTokenResult();
                setUserRole(token.claims.role as string || "user");
            }
        }
        fetchRole();
    }, [user]);

    if (loading || (!user && !loading)) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container py-10 max-w-4xl min-h-[50vh]">
            <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Card */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl ring-2 ring-primary/20">
                            {(user as any).displayName?.charAt(0) || <User className="h-8 w-8" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">{(user as any).displayName || "User"}</h2>
                            <p className="text-sm text-muted-foreground capitalize">{userRole} Account</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{user?.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">UID:</span>
                            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{user?.uid}</code>
                        </div>
                    </div>
                </div>

                {/* Feedback Card */}
                <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-6 shadow-lg relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-sm">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Share Your Feedback</h3>
                                <p className="text-xs text-slate-600 flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    Help us improve the portal
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-700 mb-6 leading-relaxed">
                            Your feedback is invaluable! Share your experience, suggestions, or report issues to help us make the Academic Portal better for everyone.
                        </p>

                        <a
                            href="https://forms.gle/igtAhR1uJo8YAiCE8"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105 active:scale-95"
                        >
                            Give Feedback
                            <ExternalLink className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </a>

                        <p className="text-xs text-center text-slate-500 mt-3 font-medium">
                            Takes less than 2 minutes • Anonymous option available
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
