import Link from "next/link";
import {
    GraduationCap,
    Award,
    Users,
    MessageSquare,
    Plus,
    ArrowRight
} from "lucide-react";

export default function AdminDashboard() {
    const modules = [
        {
            title: "Admissions",
            description: "Manage university programs and admission entries.",
            icon: GraduationCap,
            href: "/admin/admissions",
            action: "Manage Admissions",
        },
        {
            title: "Scholarships",
            description: "Update scholarship opportunities and grants.",
            icon: Award,
            href: "/admin/scholarships",
            action: "Manage Scholarships",
        },
        {
            title: "Mentor Applications",
            description: "Review and approve mentor applications.",
            icon: Users,
            href: "/admin/applications",
            action: "Review Pending",
        },
        { // Placeholder for later
            title: "Discussions",
            description: "Moderate forum discussions and reported content.",
            icon: MessageSquare,
            href: "/admin/discussions",
            action: "Moderate Forum",
        },
    ];

    return (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {modules.map((module) => (
                    <div
                        key={module.title}
                        className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="space-y-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <module.icon className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-semibold tracking-tight">
                                    {module.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {module.description}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <Link
                                href={module.href}
                                className="group inline-flex items-center text-sm font-medium text-primary hover:underline"
                            >
                                {module.action}
                                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
