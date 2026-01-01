"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Globe, BookOpen, GraduationCap, DollarSign, Calendar, ExternalLink } from "lucide-react";

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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {universities.map((item) => (
                    <motion.div
                        key={item.id}
                        layoutId={`card-${item.id}`}
                        onClick={() => setSelectedUni(item)}
                        className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-md shadow-sm transition-all hover:shadow-xl hover:border-primary/50 cursor-pointer h-full"
                    >
                        {/* Image Header */}
                        <div className="relative h-48 w-full overflow-hidden">
                            <img
                                src={item.image}
                                alt={item.university}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <p className="text-xs font-medium uppercase tracking-wider opacity-90">{item.type}</p>
                                <h3 className="text-lg font-bold line-clamp-1">{item.university}</h3>
                            </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                            <div className="space-y-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    <span>{item.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                    <span className="line-clamp-1">{item.program}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span>Deadline: {item.deadline}</span>
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-border flex justify-between items-center text-primary font-medium text-sm">
                                <span>Learn More</span>
                                <ExternalLink className="h-4 w-4" />
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
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        />
                        <motion.div
                            layoutId={`card-${selectedUni.id}`}
                            className="fixed inset-x-4 inset-y-12 md:inset-x-auto md:inset-y-auto md:max-w-3xl md:w-full bg-background rounded-3xl z-[51] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
                        >
                            <button
                                onClick={() => setSelectedUni(null)}
                                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full z-10 backdrop-blur-md transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            <div className="relative h-64 md:h-80 w-full">
                                <img
                                    src={selectedUni.image}
                                    alt={selectedUni.university}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                                <div className="absolute bottom-6 left-8 right-8">
                                    <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">{selectedUni.university}</h2>
                                    <div className="flex flex-wrap gap-4 text-sm font-medium">
                                        <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full">
                                            <MapPin className="h-4 w-4" /> {selectedUni.location}
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-secondary/10 text-secondary-foreground px-3 py-1 rounded-full">
                                            <GraduationCap className="h-4 w-4" /> {selectedUni.type}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 overflow-y-auto custom-scrollbar">
                                <div className="grid gap-8 md:grid-cols-2">
                                    <div className="space-y-6">
                                        <section>
                                            <h3 className="text-lg font-bold flex items-center gap-2 mb-3 text-primary">
                                                <Shield className="h-5 w-5" /> Requirements
                                            </h3>
                                            <p className="text-muted-foreground leading-relaxed">{selectedUni.requirements}</p>
                                        </section>

                                        <section>
                                            <h3 className="text-lg font-bold flex items-center gap-2 mb-3 text-primary">
                                                <DollarSign className="h-5 w-5" /> Fee Structure
                                            </h3>
                                            <p className="text-muted-foreground leading-relaxed">{selectedUni.fees}</p>
                                        </section>

                                        <section>
                                            <h3 className="text-lg font-bold flex items-center gap-2 mb-3 text-primary">
                                                <Calendar className="h-5 w-5" /> Admission Deadline
                                            </h3>
                                            <p className="text-muted-foreground leading-relaxed font-semibold">{selectedUni.deadline}</p>
                                        </section>
                                    </div>

                                    <div className="space-y-6">
                                        <section>
                                            <h3 className="text-lg font-bold flex items-center gap-2 mb-3 text-primary">
                                                <BookOpen className="h-5 w-5" /> Departments & Programs
                                            </h3>
                                            <p className="text-muted-foreground leading-relaxed">{selectedUni.departments}</p>
                                        </section>

                                        <div className="pt-4 space-y-3">
                                            <a
                                                href={selectedUni.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold transition-transform active:scale-95 hover:shadow-lg hover:shadow-primary/30"
                                            >
                                                Visit Official Website <Globe className="h-5 w-5" />
                                            </a>
                                            <p className="text-center text-xs text-muted-foreground">
                                                Always verify latest dates on the official university portal.
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

// Reuse Shield icon logic if not imported
function Shield({ className }: { className?: string }) {
    return <GraduationCap className={className} />;
}
