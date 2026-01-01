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

            <div className="max-w-md">
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
            </div>
        </div>
    );
}
