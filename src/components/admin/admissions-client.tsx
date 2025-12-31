"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAdmission, updateAdmission, deleteAdmission } from "@/actions/admin-actions";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AdmissionsClient({ initialData }: { initialData: any[] }) {
    const router = useRouter();
    const [items, setItems] = useState(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Form State (Simple controlled inputs for MVP)
    const [formData, setFormData] = useState({
        university: "",
        program: "",
        country: "",
        deadline: "",
    });

    const handleOpenModal = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                university: item.university,
                program: item.program,
                country: item.country,
                deadline: item.deadline,
            });
        } else {
            setEditingItem(null);
            setFormData({ university: "", program: "", country: "", deadline: "" });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingItem) {
                await updateAdmission(editingItem.id, formData);
                toast.success("Admission updated");
            } else {
                await createAdmission(formData);
                toast.success("Admission created");
            }
            router.refresh(); // Refresh Server Components
            setIsModalOpen(false);
        } catch (error) {
            toast.error("Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this entry?")) return;
        try {
            await deleteAdmission(id);
            toast.success("Admission deleted");
            router.refresh();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    {/* Header is in page.tsx usually, but we can put controls here */}
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Admission
                </button>
            </div>

            <div className="grid gap-4">
                {items.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
                        No admissions found. Add one to get started.
                    </div>
                )}
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-sm"
                    >
                        <div>
                            <h3 className="font-semibold">{item.university}</h3>
                            <p className="text-sm text-muted-foreground">
                                {item.program} • {item.country}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleOpenModal(item)}
                                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
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

            {/* Modal */}
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
                                <h2 className="text-lg font-semibold">
                                    {editingItem ? "Edit Admission" : "New Admission"}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-full p-1 hover:bg-muted transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">University</label>
                                    <input
                                        value={formData.university}
                                        onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Program</label>
                                    <input
                                        value={formData.program}
                                        onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Country</label>
                                    <input
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
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
                                        placeholder="e.g. 2024-05-01"
                                    />
                                </div>
                                <div className="flex justify-end gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
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
