"use client";

import { RoleGuard } from "@/components/auth/role-guard";

export default function MentorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RoleGuard allowedRoles={["mentor"]}>
            <div className="container py-8">
                <h1 className="text-3xl font-bold mb-8 text-primary">Mentor Dashboard</h1>
                {children}
            </div>
        </RoleGuard>
    );
}
