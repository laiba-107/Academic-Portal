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
    const pathname = usePathname();

    // Listen to auth state changes
    useEffect(() => {
        if (!auth) return; // Safety check
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    const navLinks = [
        { href: "/admissions", label: "Admissions" },
        { href: "/scholarships", label: "Scholarships" },
        { href: "/forum", label: "Forum" },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                        <GraduationCap className="h-6 w-6" />
                        <span>StudentPortal</span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                pathname === link.href ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary">
                                Dashboard
                            </Link>
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <UserIcon className="h-4 w-4" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="text-sm font-medium text-muted-foreground hover:text-primary px-3 py-2"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/signup"
                                className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
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
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary py-2",
                                pathname === link.href ? "text-primary" : "text-muted-foreground"
                            )}
                            onClick={() => setIsOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="border-t border-border pt-4 flex flex-col gap-2">
                        {user ? (
                            <Link
                                href="/dashboard"
                                className="text-sm font-medium text-muted-foreground hover:text-primary py-2"
                                onClick={() => setIsOpen(false)}
                            >
                                Dashboard
                            </Link>
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
                                    className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-center"
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
