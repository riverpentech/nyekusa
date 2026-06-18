'use client'

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";

interface Leader {
    id: string;
    full_name: string;
    position: string;
    photo_url?: string | null;
    order?: number;
}

const FALLBACK_LEADERS: Leader[] = [
    { id: "1", full_name: "Washington Mwangi", position: "Organising Secretary", photo_url: "" },
    { id: "2", full_name: "Samuel Gakuru", position: "Chairperson", photo_url: "" },
    { id: "3", full_name: "Lucy Wanjiru", position: "Secretary General", photo_url: "" },
    { id: "4", full_name: "Faith King'ori", position: "Welfare Coordinator", photo_url: "" },
];

const fetchLeaders = async (limit: number = 4): Promise<Leader[]> => {
    try {
        const response = await fetch(`/api/leadership?current=true&limit=${limit}`, {
            next: { revalidate: 3600 } // ISR: revalidate every hour
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.leaders || [];
    } catch (error) {
        console.error("Failed to fetch leaders:", error);
        return FALLBACK_LEADERS; // Return fallback data on error
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
                setLeaders(FALLBACK_LEADERS);
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

    const displayLeaders = leaders.length > 0 ? leaders : FALLBACK_LEADERS;

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
                        {error} - Showing fallback leadership data
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                    {displayLeaders.map((leader) => (
                        <Link
                            key={leader.id}
                            href={`/leadership/${leader.id}`}
                            className="text-center group transition-transform hover:scale-105"
                        >
                            <div className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden bg-muted border-2 border-border group-hover:border-primary/30 transition-colors">
                                {leader.photo_url ? (
                                    <Image
                                        src={leader.photo_url}
                                        alt={leader.full_name}
                                        width={112}
                                        height={112}
                                        className="w-full h-full object-cover"
                                        priority={false}
                                        sizes="112px"
                                        onError={(e) => {
                                            // Fallback to initials on image error
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent) {
                                                const fallback = document.createElement('div');
                                                fallback.className = 'w-full h-full flex items-center justify-center text-2xl font-heading font-bold text-muted-foreground bg-muted';
                                                fallback.textContent = leader.full_name?.charAt(0) || '?';
                                                parent.appendChild(fallback);
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl font-heading font-bold text-muted-foreground bg-muted">
                                        {leader.full_name?.charAt(0) || '?'}
                                    </div>
                                )}
                            </div>
                            <h3 className="font-body font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                                {leader.full_name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{leader.position}</p>
                        </Link>
                    ))}
                </div>

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