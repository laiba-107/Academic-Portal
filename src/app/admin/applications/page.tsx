import { adminDb } from "@/lib/firebase-admin";
import { approveApplication, rejectApplication } from "@/actions/mentor-actions";
import { Check, X } from "lucide-react";

export const dynamic = "force-dynamic";

async function getPendingApplications() {
    const snapshot = await adminDb.collection("mentorApplications")
        .where("status", "==", "pending")
        .orderBy("createdAt", "desc")
        .get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export default async function AdminApplicationsPage() {
    const applications = await getPendingApplications();

    return (
        <div className="space-y-6">
            <div className="mb-8 space-y-2">
                <h2 className="text-3xl font-bold text-primary">Pending Applications</h2>
                <p className="text-muted-foreground">
                    Review and approve mentor requests.
                </p>
            </div>

            <div className="rounded-md border border-border">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Applicant</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Expertise</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Experience</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Submitted</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {applications.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-muted-foreground">No pending applications</td>
                                </tr>
                            )}
                            {applications.map((app: any) => (
                                <tr key={app.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle font-medium">
                                        <div>{app.firstName} {app.lastName}</div>
                                        <div className="text-xs text-muted-foreground">{app.email}</div>
                                    </td>
                                    <td className="p-4 align-middle">{app.expertise}</td>
                                    <td className="p-4 align-middle max-w-[200px] truncate" title={app.experience}>{app.experience}</td>
                                    <td className="p-4 align-middle text-muted-foreground">
                                        {new Date(app.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <form action={async () => {
                                            "use server";
                                            await approveApplication(app.id, app.uid, app.email);
                                        }} className="inline-block mr-2">
                                            <button type="submit" className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors" title="Approve">
                                                <Check className="h-4 w-4" />
                                            </button>
                                        </form>
                                        <form action={async () => {
                                            "use server";
                                            await rejectApplication(app.id, app.email);
                                        }} className="inline-block">
                                            <button type="submit" className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors" title="Reject">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
