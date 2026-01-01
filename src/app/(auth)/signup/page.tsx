"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createProfile } from "@/actions/auth-actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const signupSchema = z
    .object({
        nickname: z.string().min(2, "Nickname must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        role: z.enum(["user", "mentor", "admin"]),
        adminCode: z.string().optional(),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => {
        if (data.role === "admin" && !data.adminCode) return false;
        return true;
    }, {
        message: "Admin secret code is required for Administrator role",
        path: ["adminCode"],
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            nickname: "",
            email: "",
            role: "user",
            adminCode: "",
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(data: SignupFormValues) {
        setLoading(true);
        try {
            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                data.email,
                data.password
            );
            const user = userCredential.user;

            // 2. Get ID token
            const token = await user.getIdToken();

            // 3. Create profile in Firestore (Server Action)
            const result = await createProfile(token, data.nickname, data.role, data.adminCode);

            if (!result.success) {
                throw new Error(result.error || "Failed to create profile");
            }

            // 4. Force token refresh to get custom claims (role)
            await user.getIdToken(true);

            toast.success("Account created successfully!");
            router.push("/");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold">Create an Account</h1>
                <p className="text-muted-foreground">Enter your details to get started.</p>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="nickname">
                        Nickname
                    </label>
                    <input
                        {...form.register("nickname")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="nickname"
                        placeholder="johndoe"
                    />
                    {form.formState.errors.nickname && (
                        <p className="text-sm text-red-500">{form.formState.errors.nickname.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="email">
                        Email
                    </label>
                    <input
                        {...form.register("email")}
                        type="email"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="email"
                        placeholder="m@example.com"
                    />
                    {form.formState.errors.email && (
                        <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="role">
                        Sign up as
                    </label>
                    <select
                        {...form.register("role")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="role"
                    >
                        <option value="user">Student / General User</option>
                        <option value="mentor">Mentor (Requires Admin Approval)</option>
                        <option value="admin">Administrator</option>
                    </select>
                </div>

                {form.watch("role") === "admin" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-2"
                    >
                        <label className="text-sm font-medium leading-none" htmlFor="adminCode">
                            Admin Secret Code
                        </label>
                        <input
                            {...form.register("adminCode")}
                            type="password"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            id="adminCode"
                            placeholder="Enter the master code"
                        />
                        {form.formState.errors.adminCode && (
                            <p className="text-sm text-red-500">{form.formState.errors.adminCode.message}</p>
                        )}
                    </motion.div>
                )}
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="password">
                        Password
                    </label>
                    <input
                        {...form.register("password")}
                        type="password"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="password"
                    />
                    {form.formState.errors.password && (
                        <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="confirmPassword">
                        Confirm Password
                    </label>
                    <input
                        {...form.register("confirmPassword")}
                        type="password"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="confirmPassword"
                    />
                    {form.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-colors"
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign Up
                </button>
            </form>
            <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                    Log in
                </Link>
            </div>
        </div>
    );
}
