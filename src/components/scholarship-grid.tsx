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
            <div className="flex flex-wrap gap-3 mb-12 justify-center">
                {["All", "Undergraduate Scholarship", "Graduate Program"].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-8 py-3 rounded-2xl text-sm font-black transition-all shadow-sm ${filter === cat
                            ? "bg-primary text-[#0F172A] shadow-xl shadow-primary/30 scale-105"
                            : "bg-[#1E293B] text-slate-400 hover:bg-slate-800 border border-slate-700"
                            }`}
                    >
                        {cat === "All" ? "All Opportunities" : cat}
                    </button>
                ))}
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((item) => (
                    <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setSelectedSch(item)}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border-2 border-slate-700/50 bg-[#1E293B] p-8 shadow-xl hover:shadow-2xl hover:border-primary/40 transition-all duration-300 cursor-pointer"
                    >
                        <div className="space-y-5">
                            <div className="flex justify-between items-start">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                    <Award className="h-8 w-8" />
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600`}>
                                    {item.category === "Undergraduate Scholarship" ? "UG" : "Graduate"}
                                </span>
                            </div>

                            <h3 className="text-2xl font-black text-slate-50 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                {item.name}
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                        <DollarSign className="h-4 w-4" />
                                    </div>
                                    <span>{item.amount}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-slate-400">
                                    <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <span className="font-bold">Deadline: {item.deadline}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-between text-xs font-black text-primary uppercase tracking-widest pt-5 border-t border-slate-700">
                            <span>Get Details</span>
                            <Info className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed inset-x-4 inset-y-auto md:max-w-3xl md:w-full bg-[#1E293B] rounded-[2.5rem] z-[101] shadow-2xl overflow-hidden md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 border border-slate-700"
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                                            <Award className="h-9 w-9" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{selectedSch.category}</span>
                                            <h2 className="text-3xl font-black text-white leading-none mt-1">{selectedSch.name}</h2>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedSch(null)}
                                        className="p-3 hover:bg-slate-700 text-slate-300 rounded-full transition-all hover:rotate-90"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="grid gap-8 md:grid-cols-2 mb-10">
                                    <div className="space-y-6">
                                        <div className="bg-[#0F172A]/50 p-5 rounded-2xl border border-slate-800">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                                <DollarSign className="h-3 w-3" /> Worth of Award
                                            </h4>
                                            <p className="font-black text-xl text-slate-100">{selectedSch.amount}</p>
                                        </div>
                                        <div className="bg-[#0F172A]/50 p-5 rounded-2xl border border-slate-800">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                                <Calendar className="h-3 w-3" /> Ends On
                                            </h4>
                                            <p className="font-black text-lg text-slate-100">{selectedSch.deadline}</p>
                                        </div>
                                    </div>
                                    <div className="bg-orange-500/10 p-6 rounded-3xl border border-orange-500/20">
                                        <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                            <GraduationCap className="h-3 w-3" /> Eligibility Criteria
                                        </h4>
                                        <p className="text-sm leading-relaxed font-bold text-slate-300">{selectedSch.eligibility}</p>
                                    </div>
                                </div>

                                <div className="space-y-8 pt-8 border-t border-slate-800">
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Program Brief</h4>
                                        <p className="text-slate-300 text-sm leading-relaxed font-medium">{selectedSch.description}</p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <a
                                            href={selectedSch.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-3 py-5 bg-primary text-[#0F172A] rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl shadow-primary/30 hover:shadow-primary/50"
                                        >
                                            Official Apply Page <ExternalLink className="h-5 w-5" />
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
