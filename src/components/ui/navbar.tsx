"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Menu, X, GraduationCap, User as UserIcon } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const pathname = usePathname();

    // Listen to auth state changes
    useEffect(() => {
        if (!auth) return; // Safety check
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                const token = await user.getIdTokenResult();
                setUserRole(token.claims.role as string || "user");
            } else {
                setUserRole(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/admissions", label: "Admissions" },
        { href: "/scholarships", label: "Scholarships" },
        { href: "/forum", label: "Forum" },
        { href: "/chatbot", label: "AI Chatbot" },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">StudentPortal</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => {
                            // Hide protected routes if no user
                            const isProtected = link.href !== '/';
                            if (!user && isProtected) return null;

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "text-[13px] font-black uppercase tracking-[0.1em] transition-all hover:text-primary relative py-1",
                                        pathname === link.href ? "text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary after:rounded-full" : "text-slate-500"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            {userRole === "admin" && (
                                <Link
                                    href="/admin"
                                    className="text-sm font-semibold text-primary/80 hover:text-primary px-3 py-2 rounded-lg hover:bg-primary/5 transition-all"
                                >
                                    Admin Panel
                                </Link>
                            )}
                            <Link
                                href="/dashboard"
                                className={cn(
                                    "text-sm font-medium transition-all px-3 py-2 rounded-lg",
                                    pathname === "/dashboard" ? "bg-primary/5 text-primary" : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                Dashboard
                            </Link>
                            <button
                                onClick={() => auth.signOut()}
                                className="h-9 items-center justify-center rounded-lg border border-border px-4 text-xs font-bold text-muted-foreground hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-all uppercase tracking-wider"
                            >
                                Sign Out
                            </button>
                            <Link href="/dashboard" className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary ring-2 ring-primary/20 hover:ring-primary/40 transition-all overflow-hidden border border-primary/20">
                                <UserIcon className="h-5 w-5" />
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link
                                href="/login"
                                className="text-sm font-bold text-slate-500 hover:text-primary px-4 py-2 transition-colors"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/signup"
                                className="text-sm font-bold bg-primary text-primary-foreground px-6 py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                            >
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-muted-foreground"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden border-t border-border bg-background p-4 flex flex-col gap-4">
                    {navLinks.map((link) => {
                        if (!user && (link.href === '/forum' || link.href === '/scholarships')) return null;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-xs font-black uppercase tracking-[0.15em] transition-colors hover:text-primary py-3 border-b border-border/40",
                                    pathname === link.href ? "text-primary" : "text-muted-foreground"
                                )}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                    <div className="border-t border-border pt-4 flex flex-col gap-2">
                        {user ? (
                            <>
                                {userRole === "admin" && (
                                    <Link
                                        href="/admin"
                                        className="text-sm font-bold text-primary hover:text-primary/80 py-2 border-b border-border/50"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Admin Panel
                                    </Link>
                                )}
                                <Link
                                    href="/dashboard"
                                    className="text-sm font-medium text-muted-foreground hover:text-primary py-2"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Dashboard
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-muted-foreground hover:text-primary py-2"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/signup"
                                    className="text-sm font-bold bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-center"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
