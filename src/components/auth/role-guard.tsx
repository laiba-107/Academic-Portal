"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push("/login"); // Redirect to login if not authenticated
                return;
            }

            // Force refresh token to ensure fresh claims
            const tokenResult = await user.getIdTokenResult();
            const role = tokenResult.claims.role as string;

            if (allowedRoles.includes(role)) {
                setAuthorized(true);
            } else {
                router.push("/"); // Redirect to home if authorized but wrong role
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [allowedRoles, router]);

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!authorized) return null;

    return <>{children}</>;
}
