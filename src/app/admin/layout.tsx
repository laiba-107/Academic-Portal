"use client";

import { RoleGuard } from "@/components/auth/role-guard";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RoleGuard allowedRoles={["admin"]}>
            <div className="container py-8">
                <h1 className="text-3xl font-bold mb-8 text-primary">Admin Dashboard</h1>
                {children}
            </div>
        </RoleGuard>
    );
}
