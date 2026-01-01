"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Award, MapPin, ExternalLink, Info, DollarSign, Calendar, GraduationCap } from "lucide-react";

interface Scholarship {
    id: string;
    name: string;
    category: string;
    amount: string;
    eligibility: string;
    description: string;
    link: string;
    deadline: string;
}

export default function ScholarshipGrid({ scholarships }: { scholarships: Scholarship[] }) {
    const [selectedSch, setSelectedSch] = useState<Scholarship | null>(null);
    const [filter, setFilter] = useState<string>("All");

    const filtered = filter === "All"
        ? scholarships
        : scholarships.filter(s => s.category === filter);

    return (
        <>
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
                {["All", "Local", "International"].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${filter === cat
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                                : "bg-white/50 hover:bg-white text-muted-foreground"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((item) => (
                    <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setSelectedSch(item)}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-white/60 backdrop-blur-md p-6 shadow-sm transition-all hover:shadow-xl hover:border-primary/50 cursor-pointer"
                    >
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Award className="h-6 w-6" />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-secondary/10 text-secondary-foreground`}>
                                    {item.category}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                {item.name}
                            </h3>

                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-primary" />
                                    <span className="font-medium text-foreground">{item.amount}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span>Deadline: {item.deadline}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-border flex items-center text-xs font-bold text-primary gap-2">
                            VIEW DETAILS <Info className="h-3 w-3" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selectedSch && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedSch(null)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed inset-x-4 inset-y-auto md:max-w-2xl md:w-full bg-background rounded-3xl z-[51] shadow-2xl overflow-hidden md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Award className="h-8 w-8" />
                                    </div>
                                    <button
                                        onClick={() => setSelectedSch(null)}
                                        className="p-2 hover:bg-muted rounded-full transition-colors"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="mb-8">
                                    <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">{selectedSch.category} Opportunity</span>
                                    <h2 className="text-3xl font-extrabold text-foreground leading-tight">{selectedSch.name}</h2>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2 mb-8">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2 mb-1">
                                                <DollarSign className="h-4 w-4" /> Award Amount
                                            </h4>
                                            <p className="font-semibold text-lg">{selectedSch.amount}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2 mb-1">
                                                <Calendar className="h-4 w-4" /> Application Deadline
                                            </h4>
                                            <p className="font-semibold">{selectedSch.deadline}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2 mb-1">
                                                <GraduationCap className="h-4 w-4" /> Eligibility
                                            </h4>
                                            <p className="text-sm leading-relaxed">{selectedSch.eligibility}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-6 border-t border-border">
                                    <div>
                                        <h4 className="text-sm font-bold text-muted-foreground uppercase mb-2">Description</h4>
                                        <p className="text-muted-foreground text-sm leading-relaxed">{selectedSch.description}</p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <a
                                            href={selectedSch.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-2xl font-bold transition-transform active:scale-95 hover:shadow-lg hover:shadow-primary/30"
                                        >
                                            Apply via Official Portal <ExternalLink className="h-5 w-5" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
