'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";
import Avatar from "@/components/shared/Avatar";

interface Leader {
    id: string;
    full_name: string;
    position: string;
    photo_url?: string | null;
    order?: number;
}

const fetchLeaders = async (limit: number = 4): Promise<Leader[]> => {
    try {
        const response = await fetch(`/api/leadership?limit=${limit}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Failed to fetch leaders:", error);
        return [];
    }
};

export default function LeadershipPreview() {
    const [leaders, setLeaders] = useState<Leader[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadLeaders = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchLeaders(4);
                setLeaders(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load leaders");
            } finally {
                setLoading(false);
            }
        };

        loadLeaders();
    }, []);

    // Loading skeleton
    if (loading) {
        return (
            <section className="py-20 sm:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeader
                        badge="Leadership"
                        title="Meet Our Leaders"
                        description="Dedicated student leaders serving the NYEKUSA community."
                    />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="text-center animate-pulse">
                                <div className="w-28 h-28 mx-auto mb-4 rounded-full bg-muted" />
                                <div className="h-4 bg-muted rounded w-20 mx-auto mb-2" />
                                <div className="h-3 bg-muted rounded w-16 mx-auto" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 sm:py-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader
                    badge="Leadership"
                    title="Meet Our Leaders"
                    description="Dedicated student leaders serving the NYEKUSA community."
                />

                {error && (
                    <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {leaders.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-white mb-10 max-w-lg mx-auto">
                        <UsersIcon className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-slate-700">No leaders to display</p>
                        <p className="text-xs text-slate-450 mt-1">Please assign leaders in the admin panel.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                        {leaders.map((leader) => (
                            <Link
                                key={leader.id}
                                href="/leadership"
                                className="text-center group transition-transform hover:scale-105"
                            >
                                <Avatar
                                    fullName={leader.full_name}
                                    photoUrl={leader.photo_url}
                                    size="lg"
                                    className="mx-auto mb-5"
                                />

                                <h3 className="font-body font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                                    {leader.full_name}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">{leader.position}</p>
                            </Link>
                        ))}
                    </div>
                )}

                <div className="text-center">
                    <Link href="/leadership">
                        <Button variant="outline" className="font-medium">
                            Full Leadership Team <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}