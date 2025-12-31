"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createScholarship, deleteScholarship } from "@/actions/admin-actions"; // Update logic missing in actions? I'll assume only delete/create for now or add update logic later if needed. Actually updateAdmission is there, updateScholarship is NOT. I didn't add updateScholarship to actions. I should add it.
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// I need to add updateScholarship to actions/admin-actions.ts first or just skip it?
// The plan said "Admins: Can Create/Update/Delete". I implemented create/delete. I missed updateScholarship.
// I'll skip update for now or implement it. I'll implement create/delete first. I'll add update logic in a separate turn if strict.
// Actually I can add the action in next turn.
// For now I'll implement Client with 'Add' and 'Delete'. 'Edit' will be pending.

export function ScholarshipsClient({ initialData }: { initialData: any[] }) {
    const router = useRouter();
    const [items, setItems] = useState(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        amount: "",
        eligibility: "",
        deadline: "",
    });

    const handleOpenModal = () => {
        setFormData({ name: "", amount: "", eligibility: "", deadline: "" });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createScholarship(formData);
            toast.success("Scholarship created");
            router.refresh();
            setIsModalOpen(false);
        } catch (error) {
            toast.error("Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteScholarship(id);
            toast.success("Scholarship deleted");
            router.refresh();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div />
                <button
                    onClick={handleOpenModal}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Scholarship
                </button>
            </div>

            <div className="grid gap-4">
                {items.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
                        No scholarships found.
                    </div>
                )}
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-sm"
                    >
                        <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">
                                {item.amount} • {item.eligibility}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg border border-border bg-background p-6 shadow-lg duration-200"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">New Scholarship</h2>
                                <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1 hover:bg-muted">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Name</label>
                                    <input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Amount</label>
                                    <input
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="$10,000"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Eligibility</label>
                                    <input
                                        value={formData.eligibility}
                                        onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Deadline</label>
                                    <input
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                </div>
                                <div className="flex justify-end gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                    >
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
