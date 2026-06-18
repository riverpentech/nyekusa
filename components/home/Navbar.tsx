"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";

const navLinks = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Leadership", path: "/leadership" },
    { label: "Events", path: "/events" },
    { label: "Members", path: "/members" },
    { label: "Opportunities", path: "/opportunities" },
    { label: "Alumni", path: "/alumni" },
    { label: "Projects", path: "/projects" },
    { label: "Resources", path: "/resources" },
    { label: "Gallery", path: "/gallery" },
    { label: "Contact", path: "/contact" },
];

const primaryLinks = navLinks.slice(0, 6);
const moreLinks = navLinks.slice(6);

const mobileMenuVariants: Variants = {
    hidden: {
        opacity: 0,
        height: 0,
        transition: {
            duration: 0.2,
            ease: "easeInOut",
            when: "afterChildren"
        }
    },
    visible: {
        opacity: 1,
        height: "auto",
        transition: {
            duration: 0.3,
            ease: "easeInOut",
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
};

const dropdownVariants: Variants = {
    hidden: {
        opacity: 0,
        y: -10,
        scale: 0.95,
        transition: {
            duration: 0.15,
            ease: "easeOut"
        }
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.2,
            ease: "easeOut"
        }
    }
};

const mobileLinkVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.2,
            ease: "easeOut"
        }
    }
};

const mobileButtonVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.2,
            ease: "easeOut"
        }
    }
};

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const pathname = usePathname();
    const isHome = pathname === "/";

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        setOpen(false);
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
                        <Link href="/join" className="hidden sm:block">
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
                            <motion.div
                                className="pt-3 pb-1"
                                variants={mobileButtonVariants}
                            >
                                <Link href="/join">
                                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                                        Join NYEKUSA
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}