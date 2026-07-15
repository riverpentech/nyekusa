"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import Avatar from "@/components/shared/Avatar";

const navLinks = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Leadership", path: "/leadership" },
    { label: "Events", path: "/events" },
    { label: "Alumni", path: "/alumni" },
    { label: "Gallery", path: "/gallery" },
    { label: "Contact", path: "/contact" },
];

const primaryLinks = navLinks.slice(0, 5);
const moreLinks = navLinks.slice(5);

const mobileMenuVariants: Variants = {
    hidden: {
        opacity: 0,
        height: 0,
        transition: { duration: 0.2, ease: "easeInOut", when: "afterChildren" }
    },
    visible: {
        opacity: 1,
        height: "auto",
        transition: { duration: 0.3, ease: "easeInOut", staggerChildren: 0.05, delayChildren: 0.1 }
    }
};

const dropdownVariants: Variants = {
    hidden: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15, ease: "easeOut" } },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } }
};

const mobileLinkVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } }
};

const mobileButtonVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
};

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const pathname = usePathname();
    const isHome = pathname === "/";
    const { data: session, status } = useSession();
    const isAuthenticated = status === "authenticated";
    const isLoadingSession = status === "loading";

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        queueMicrotask(() => {
            setOpen(false);
        });
    }, [pathname]);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [open]);

    const navBg = isHome
        ? scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-border/40"
            : "bg-transparent border-b border-white/10"
        : "bg-white/95 backdrop-blur-xl border-b border-border/40 shadow-sm";

    const textColor = isHome && !scrolled ? "text-white" : "text-foreground";
    const mutedTextColor = isHome && !scrolled ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground";
    const activeBg = isHome && !scrolled ? "bg-white/15 text-white" : "bg-accent text-primary";

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="NYEKUSA Home">
                        <div className="relative w-10 h-10">
                            <Image
                                src="/nyekusa.svg"
                                alt="NYEKUSA Logo"
                                fill
                                className="object-contain"
                                sizes="40px"
                                priority
                            />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className={`font-heading font-bold text-base tracking-wider transition-colors ${textColor}`}>
                                NYEKUSA
                            </span>
                            <span className={`font-body text-[9px] italic tracking-wide transition-colors ${isHome && !scrolled ? "text-white/60" : "text-muted-foreground"}`}>
                                our unity, our strength
                            </span>
                        </div>
                    </Link>

                    <div className="hidden lg:flex items-center gap-0.5">
                        {primaryLinks.map((link) => (
                            <Link
                                key={link.path}
                                href={link.path}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                                    pathname === link.path
                                        ? activeBg
                                        : `${mutedTextColor} hover:bg-white/10`
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Desktop Dashboard Link for authenticated users */}
                        {isAuthenticated && (
                            <Link
                                href="/dashboard"
                                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                                    pathname === "/dashboard"
                                        ? activeBg
                                        : isHome && !scrolled
                                            ? "text-secondary hover:bg-white/10"
                                            : "text-primary hover:bg-accent"
                                }`}
                            >
                                <LayoutDashboard className="w-3.5 h-3.5" />
                                Dashboard
                            </Link>
                        )}

                        {/* Desktop Admin Panel Link for Admin users */}
                        {isAuthenticated && (session?.user as any)?.role === "ADMIN" && (
                            <Link
                                href="/admin/dashboard"
                                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                                    pathname.startsWith("/admin")
                                        ? activeBg
                                        : isHome && !scrolled
                                            ? "text-amber-300 hover:bg-white/10"
                                            : "text-amber-800 hover:bg-amber-50"
                                }`}
                            >
                                <Shield className="w-3.5 h-3.5" />
                                Admin Panel
                            </Link>
                        )}

                        <div
                            className="relative group"
                            onMouseEnter={() => setIsDropdownOpen(true)}
                            onMouseLeave={() => setIsDropdownOpen(false)}
                        >
                            <button
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1 ${mutedTextColor} hover:bg-white/10`}
                                aria-expanded={isDropdownOpen}
                                aria-haspopup="true"
                            >
                                More
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        variants={dropdownVariants}
                                        className="absolute top-full right-0 mt-2 w-44 bg-white border border-border rounded-xl shadow-lg py-1.5 z-50"
                                    >
                                        {moreLinks.map((link) => (
                                            <Link
                                                key={link.path}
                                                href={link.path}
                                                className={`flex items-center px-4 py-2.5 text-sm transition-colors ${
                                                    pathname === link.path
                                                        ? "text-primary font-medium bg-accent"
                                                        : "text-foreground hover:bg-muted hover:text-foreground"
                                                }`}
                                            >
                                                {link.label}
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        {isLoadingSession ? (
                            <div className="hidden sm:block w-9 h-9 rounded-full bg-muted animate-pulse" />
                        ) : isAuthenticated && session?.user ? (
                            <div className="hidden sm:flex items-center gap-2">
                                <Link href="/dashboard/profile" aria-label="View your profile">
                                    <Avatar
                                        fullName={session.user.name ?? "?"}
                                        photoUrl={session.user.image}
                                        size="sm"
                                    />
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className={`w-9 h-9 rounded-md transition-colors ${
                                        isHome && !scrolled
                                            ? "text-white/80 hover:text-white hover:bg-white/10"
                                            : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    }`}
                                    title="Log out"
                                >
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-2">
                                <Link href="/signin">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`font-semibold text-sm px-4 h-9 transition-all ${
                                            isHome && !scrolled
                                                ? "text-white hover:bg-white/10"
                                                : "text-slate-700 hover:bg-slate-100"
                                        }`}
                                    >
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/join">
                                    <Button
                                        size="sm"
                                        className={`font-semibold text-sm px-4 h-9 transition-all ${
                                            isHome && !scrolled
                                                ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                                                : "bg-primary hover:bg-primary/90 text-primary-foreground"
                                        }`}
                                    >
                                        Join NYEKUSA
                                    </Button>
                                </Link>
                            </div>
                        )}
                        <button
                            onClick={() => setOpen(!open)}
                            className={`lg:hidden p-2 rounded-md transition-colors ${
                                isHome && !scrolled ? "text-white hover:bg-white/10" : "text-foreground hover:bg-muted"
                            }`}
                            aria-label={open ? "Close menu" : "Open menu"}
                            aria-expanded={open}
                        >
                            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={mobileMenuVariants}
                        className="lg:hidden border-t border-border/50 bg-white/98 backdrop-blur-xl shadow-xl overflow-hidden"
                    >
                        <div className="px-4 py-4 space-y-0.5 max-h-[calc(100vh-4rem)] overflow-y-auto">
                            {navLinks.map((link) => (
                                <motion.div
                                    key={link.path}
                                    variants={mobileLinkVariants}
                                >
                                    <Link
                                        href={link.path}
                                        className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                            pathname === link.path
                                                ? "text-primary bg-accent"
                                                : "text-foreground hover:bg-muted"
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}

                            {/* Mobile Dashboard Link for authenticated users */}
                            {isAuthenticated && (
                                <motion.div variants={mobileLinkVariants}>
                                    <Link
                                        href="/dashboard"
                                        className={`flex items-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                                            pathname === "/dashboard"
                                                ? "text-primary bg-accent"
                                                : "text-primary hover:bg-muted"
                                        }`}
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        Dashboard
                                    </Link>
                                </motion.div>
                            )}

                            {/* Mobile Admin Panel Link for Admin users */}
                            {isAuthenticated && (session?.user as any)?.role === "ADMIN" && (
                                <motion.div variants={mobileLinkVariants}>
                                    <Link
                                        href="/admin/dashboard"
                                        className={`flex items-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                                            pathname.startsWith("/admin")
                                                ? "text-amber-800 bg-amber-50"
                                                : "text-amber-800 hover:bg-muted"
                                        }`}
                                    >
                                        <Shield className="w-4 h-4" />
                                        Admin Panel
                                    </Link>
                                </motion.div>
                            )}

                            <motion.div
                                className="pt-3 pb-1 space-y-2"
                                variants={mobileButtonVariants}
                            >
                                {isAuthenticated && session?.user ? (
                                    <>
                                        <Link
                                            href="/dashboard/profile"
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                                        >
                                            <Avatar fullName={session.user.name ?? "?"} photoUrl={session.user.image} size="sm" />
                                            <span className="text-sm font-medium text-foreground">View Profile</span>
                                        </Link>
                                        <button
                                            onClick={() => signOut({ callbackUrl: "/" })}
                                            className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span className="text-sm font-medium">Log Out</span>
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex gap-2">
                                        <Link href="/signin" className="flex-1">
                                            <Button variant="outline" className="w-full font-semibold border-slate-200 text-slate-800">
                                                Sign In
                                            </Button>
                                        </Link>
                                        <Link href="/join" className="flex-1">
                                            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                                                Join NYEKUSA
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}