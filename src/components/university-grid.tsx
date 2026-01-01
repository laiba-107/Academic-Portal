"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Globe, BookOpen, GraduationCap, DollarSign, Calendar, ExternalLink, Info, ArrowRight, CheckCircle2 } from "lucide-react";

interface University {
    id: string;
    university: string;
    location: string;
    type: string;
    website: string;
    requirements: string;
    fees: string;
    departments: string;
    image: string;
    country: string;
    program: string;
    deadline: string;
}

export default function UniversityGrid({ universities }: { universities: University[] }) {
    const [selectedUni, setSelectedUni] = useState<University | null>(null);

    return (
        <>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {universities.map((item) => (
                    <motion.div
                        key={item.id}
                        layoutId={`card-${item.id}`}
                        onClick={() => setSelectedUni(item)}
                        className="group relative flex flex-col overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-xl hover:shadow-2xl hover:border-primary transition-all duration-300 cursor-pointer h-full"
                    >
                        {/* Image Header */}
                        <div className="relative h-56 w-full overflow-hidden">
                            <img
                                src={item.image}
                                alt={item.university}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                            <div className="absolute bottom-5 left-6 right-6 text-white text-shadow">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-primary-foreground drop-shadow-md">{item.type}</p>
                                <h3 className="text-xl font-bold line-clamp-2 drop-shadow-lg">{item.university}</h3>
                            </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-7 flex-1 flex flex-col justify-between space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                                    <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <span>{item.location}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                                    <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                                        <BookOpen className="h-4 w-4" />
                                    </div>
                                    <span className="line-clamp-1">{item.program}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <span className="font-bold">Deadline: {item.deadline}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 flex items-center justify-center gap-2">
                                    Full Details <Info className="h-4 w-4" />
                                </button>
                                <a
                                    href={item.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-4 bg-slate-100 text-slate-900 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                                    title="Go to Admission Portal"
                                >
                                    <ExternalLink className="h-5 w-5" />
                                </a>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selectedUni && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedUni(null)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
                        />
                        <motion.div
                            layoutId={`card-${selectedUni.id}`}
                            className="fixed inset-x-4 inset-y-12 md:inset-x-auto md:inset-y-auto md:max-w-4xl md:w-full bg-white rounded-[2.5rem] z-[101] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
                        >
                            <button
                                onClick={() => setSelectedUni(null)}
                                className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/40 text-white rounded-full z-10 backdrop-blur-xl transition-all hover:rotate-90"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            <div className="relative h-72 md:h-96 w-full">
                                <img
                                    src={selectedUni.image}
                                    alt={selectedUni.university}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
                                <div className="absolute bottom-8 left-10 right-10">
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        <div className="flex items-center gap-2 bg-primary text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                                            <MapPin className="h-3 w-3" /> {selectedUni.location}
                                        </div>
                                        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md text-slate-900 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-slate-200">
                                            <GraduationCap className="h-3 w-3" /> {selectedUni.type}
                                        </div>
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">{selectedUni.university}</h2>
                                </div>
                            </div>

                            <div className="p-10 pt-4 overflow-y-auto custom-scrollbar flex-1">
                                <div className="grid gap-10 md:grid-cols-2">
                                    <div className="space-y-8">
                                        <section className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                            <h3 className="text-xl font-black flex items-center gap-3 mb-4 text-primary">
                                                <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </div> Admission Requirements
                                            </h3>
                                            <p className="text-slate-600 leading-relaxed font-medium">{selectedUni.requirements}</p>
                                        </section>

                                        <section className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                            <h3 className="text-xl font-black flex items-center gap-3 mb-4 text-emerald-600">
                                                <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                                    <DollarSign className="h-5 w-5" />
                                                </div> Fee Structure
                                            </h3>
                                            <p className="text-slate-600 leading-relaxed font-medium">{selectedUni.fees}</p>
                                        </section>
                                    </div>

                                    <div className="space-y-8">
                                        <section className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                            <h3 className="text-xl font-black flex items-center gap-3 mb-4 text-orange-600">
                                                <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                                    <BookOpen className="h-5 w-5" />
                                                </div> Major Departments
                                            </h3>
                                            <p className="text-slate-600 leading-relaxed font-medium">{selectedUni.departments}</p>
                                        </section>

                                        <div className="pt-4 flex flex-col gap-4">
                                            <a
                                                href={selectedUni.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group flex items-center justify-center gap-3 w-full py-5 bg-primary text-white rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl shadow-primary/30 hover:shadow-primary/50"
                                            >
                                                Apply Now <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                                            </a>
                                            <p className="text-center text-sm font-bold text-slate-400">
                                                Deadline: {selectedUni.deadline}
                                            </p>
                                        </div>
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
