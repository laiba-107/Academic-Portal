"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { submitApplication } from "@/actions/mentor-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

const applicationSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    expertise: z.string().min(2, "Area of expertise is required"),
    experience: z.string().min(10, "Please describe your experience"),
    motivation: z.string().min(20, "Please explain why you want to be a mentor"),
    linkedIn: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export default function ApplyMentorPage() {
    const router = useRouter();
    const [user, loadingUser] = useAuthState(auth);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const totalSteps = 2;

    const form = useForm<ApplicationFormValues>({
        resolver: zodResolver(applicationSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            expertise: "",
            experience: "",
            motivation: "",
            linkedIn: "",
        },
    });

    async function onSubmit(data: ApplicationFormValues) {
        if (!user) {
            toast.error("You must be logged in to apply.");
            router.push("/login"); // Or handle better
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...data,
                uid: user.uid,
                email: user.email,
                status: "pending"
            };

            const result = await submitApplication(payload);
            if (!result.success) throw new Error(result.error);

            setStep(3); // Success step
            toast.success("Application submitted successfully!");
        } catch (error: any) {
            toast.error(error.message || "Submission failed");
        } finally {
            setLoading(false);
        }
    }

    const nextStep = async () => {
        // Validate current step fields
        const fields = step === 1
            ? ["firstName", "lastName", "expertise", "linkedIn"]
            : ["experience", "motivation"];

        // @ts-ignore
        const isValid = await form.trigger(fields);
        if (isValid) setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    if (step === 3) {
        return (
            <div className="container max-w-lg py-20 text-center space-y-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex justify-center"
                >
                    <div className="rounded-full bg-green-100 p-6 text-green-600">
                        <CheckCircle className="h-12 w-12" />
                    </div>
                </motion.div>
                <h1 className="text-3xl font-bold">Application Received!</h1>
                <p className="text-muted-foreground">
                    Thank you for applying to be a mentor. We will review your application and get back to you shortly via email.
                </p>
                <button
                    onClick={() => router.push("/")}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                    Return Home
                </button>
            </div>
        )
    }

    return (
        <div className="container max-w-2xl py-12">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold text-primary">Mentor Application</h1>
                <p className="text-muted-foreground">Share your expertise and help students succeed.</p>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-4">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: "0%" }}
                        animate={{ width: `${(step / totalSteps) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
                <p className="text-xs text-right text-muted-foreground mt-1">Step {step} of {totalSteps}</p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">First Name</label>
                                    <input {...form.register("firstName")} className="flex h-10 w-full rounded-md border border-input bg-background px-3" />
                                    {form.formState.errors.firstName && <p className="text-xs text-red-500">{form.formState.errors.firstName.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Last Name</label>
                                    <input {...form.register("lastName")} className="flex h-10 w-full rounded-md border border-input bg-background px-3" />
                                    {form.formState.errors.lastName && <p className="text-xs text-red-500">{form.formState.errors.lastName.message}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Area of Expertise</label>
                                <input {...form.register("expertise")} className="flex h-10 w-full rounded-md border border-input bg-background px-3" placeholder="e.g. Computer Science, Medicine" />
                                {form.formState.errors.expertise && <p className="text-xs text-red-500">{form.formState.errors.expertise.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">LinkedIn URL (Optional)</label>
                                <input {...form.register("linkedIn")} className="flex h-10 w-full rounded-md border border-input bg-background px-3" placeholder="https://linkedin.com/in/..." />
                                {form.formState.errors.linkedIn && <p className="text-xs text-red-500">{form.formState.errors.linkedIn.message}</p>}
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Experience</label>
                                <textarea {...form.register("experience")} className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2" placeholder="Describe your academic and professional background..." />
                                {form.formState.errors.experience && <p className="text-xs text-red-500">{form.formState.errors.experience.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Motivation</label>
                                <textarea {...form.register("motivation")} className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2" placeholder="Why do you want to join our mentor network?" />
                                {form.formState.errors.motivation && <p className="text-xs text-red-500">{form.formState.errors.motivation.message}</p>}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex justify-between pt-4">
                    {step > 1 ? (
                        <button type="button" onClick={prevStep} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </button>
                    ) : <div />}

                    {step < totalSteps ? (
                        <button type="button" onClick={nextStep} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                    ) : (
                        <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Application
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
