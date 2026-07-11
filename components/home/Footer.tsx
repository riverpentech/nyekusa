"use client"

import React from "react";
import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react";
import { usePathname } from "next/navigation";

const footerLinks = {
    Association: [
        { label: "About Us", path: "/about" },
        { label: "Leadership", path: "/leadership" },
        { label: "Members", path: "/members" },
        { label: "Alumni", path: "/alumni" },
    ],
    Engage: [
        { label: "Events", path: "/events" },
        { label: "Opportunities", path: "/opportunities" },
        { label: "Projects", path: "/projects" },
        { label: "Gallery", path: "/gallery" },
    ],
    Resources: [
        { label: "Resource Center", path: "/resources" },
        { label: "Contact Us", path: "/contact" },
    ],
};

export default function Footer() {
    const pathname = usePathname();
    const isDashboard = pathname.startsWith("/dashboard");

    if (isDashboard) {
        return (
            <footer className="bg-slate-50 border-t border-slate-200 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500">
                    <p className="text-xs">
                        © {new Date().getFullYear()} NYEKUSA. All rights reserved. | Designed and developed by{" "}
                        <a
                            href="https://www.riverpen.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-800 hover:underline transition-colors font-medium"
                        >
                            RiverPen Technologies
                        </a>
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>Nyeri County · DeKUT</span>
                    </div>
                </div>
            </footer>
        );
    }

    return (
        <footer className="bg-foreground text-background/80">
            <div className="flex h-1">
                <div className="flex-1 bg-primary" />
                <div className="flex-1 bg-secondary" />
                <div className="flex-1 bg-destructive" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 shrink-0">
                                <img
                                    src="/nyekusa.svg"
                                    alt="NYEKUSA Logo"
                                    className="w-full h-full object-contain brightness-0 invert opacity-90"
                                />
                            </div>
                            <div>
                                <p className="font-heading font-bold text-xl text-background leading-none tracking-wide">NYEKUSA</p>
                                <p className="font-heading text-xs italic text-secondary opacity-90 mt-0.5 tracking-wide">
                                    our unity, our strength
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-background/50 leading-relaxed mb-5 max-w-xs">
                            Nyeri Kimathi University Student Association — uniting students from Nyeri County at Dedan Kimathi University of Technology, Kenya.
                        </p>

                        <div className="space-y-2 text-xs text-background/40">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                <span>DeKUT Campus, Nyeri, Kenya</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                <a href="mailto:nyekusa01@gmail.com" className="hover:text-secondary transition-colors">
                                    nyekusa01@gmail.com
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 shrink-0" />
                                <a href="tel:+254768397693" className="hover:text-secondary transition-colors">
                                    +254 768 397 693
                                </a>
                            </div>
                        </div>
                    </div>

                    {Object.entries(footerLinks).map(([heading, links]) => (
                        <div key={heading}>
                            <h4 className="font-body font-semibold text-xs text-background mb-4 tracking-widest uppercase">
                                {heading}
                            </h4>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link.path}>
                                        <Link
                                            href={link.path}
                                            className="text-sm text-background/45 hover:text-secondary transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-background/8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-background/25">
                        © {new Date().getFullYear()} NYEKUSA. All rights reserved. | Designed and developed by{" "}
                        <a
                            href="https://www.riverpen.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-secondary hover:underline transition-colors"
                        >
                            RiverPen Technologies
                        </a>
                    </p>
                    <div className="flex items-center gap-4 text-xs text-background/25">
                        <span>Nyeri County · DeKUT</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}