'use client'

import React, { useState, useEffect } from "react";
import SectionHeader from "@/components/shared/SectionHeader";

// Type definitions
interface Testimonial {
    id: string;
    full_name: string;
    role: string;
    quote: string;
    is_featured?: boolean;
    created_date?: string;
}

// Fallback data
const FALLBACK_TESTIMONIALS: Testimonial[] = [
    {
        id: "1",
        full_name: "David Kibet",
        role: "Former Chairperson · Class of 2022",
        quote: "NYEKUSA gave me a second family at DeKUT. The mentorship and connections I built here shaped my career path in ways I never imagined."
    },
    {
        id: "2",
        full_name: "Faith Wambui",
        role: "Software Engineer, Safaricom",
        quote: "From a shy freshman to a confident professional — NYEKUSA's events and leadership programs transformed my university experience completely."
    },
    {
        id: "3",
        full_name: "Samuel Njoroge",
        role: "Alumni · Class of 2020",
        quote: "The alumni network is incredible. Even years after graduation, the bonds formed through NYEKUSA continue to open doors and create new opportunities."
    },
];

// Quote icon as a React component
const QuoteIcon = ({ className = "mb-4 opacity-30" }: { className?: string }) => (
    <svg
        width="32"
        height="24"
        viewBox="0 0 32 24"
        fill="none"
        className={className}
        aria-hidden="true"
    >
        <path
            d="M0 24V14.4C0 10.08 1.12 6.64 3.36 4.08C5.6 1.36 9.12 0 13.92 0V4.32C11.52 4.32 9.76 5.04 8.64 6.48C7.52 7.76 6.96 9.52 6.96 11.76H13.92V24H0ZM18.08 24V14.4C18.08 10.08 19.2 6.64 21.44 4.08C23.68 1.36 27.2 0 32 0V4.32C29.6 4.32 27.84 5.04 26.72 6.48C25.6 7.76 25.04 9.52 25.04 11.76H32V24H18.08Z"
            fill="currentColor"
        />
    </svg>
);

// API service
const fetchTestimonials = async (limit: number = 3): Promise<Testimonial[]> => {
    try {
        const response = await fetch(`/api/testimonials?featured=true&limit=${limit}`, {
            next: { revalidate: 3600 } // ISR: revalidate every hour
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.testimonials || [];
    } catch (error) {
        console.error("Failed to fetch testimonials:", error);
        return FALLBACK_TESTIMONIALS;
    }
};

export default function TestimonialsSection() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadTestimonials = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchTestimonials(3);
                setTestimonials(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load testimonials");
                setTestimonials(FALLBACK_TESTIMONIALS);
            } finally {
                setLoading(false);
            }
        };

        loadTestimonials();
    }, []);

    // Loading skeleton
    if (loading) {
        return (
            <section className="py-20 sm:py-28 bg-card border-y border-border/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeader
                        badge="Testimonials"
                        title="Voices of NYEKUSA"
                        description="Hear from members and alumni about the lasting impact of our community."
                    />
                    <div className="grid md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-background rounded-xl border border-border/50 p-7 animate-pulse">
                                <div className="mb-4">
                                    <div className="w-8 h-6 bg-muted rounded" />
                                </div>
                                <div className="space-y-2 mb-6">
                                    <div className="h-4 bg-muted rounded w-full" />
                                    <div className="h-4 bg-muted rounded w-5/6" />
                                    <div className="h-4 bg-muted rounded w-4/6" />
                                </div>
                                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                                    <div className="w-9 h-9 rounded-full bg-muted" />
                                    <div className="space-y-2">
                                        <div className="h-3 bg-muted rounded w-24" />
                                        <div className="h-2 bg-muted rounded w-20" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    const displayTestimonials = testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS;

    // Color mapping for testimonials
    const getTestimonialStyles = (index: number) => {
        const styles = [
            { accent: "bg-primary", avatar: "bg-primary/10 text-primary" },
            { accent: "bg-secondary", avatar: "bg-secondary/20 text-secondary-foreground" },
            { accent: "bg-destructive", avatar: "bg-destructive/10 text-destructive" }
        ];
        return styles[index % styles.length];
    };

    return (
        <section className="py-20 sm:py-28 bg-card border-y border-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader
                    badge="Testimonials"
                    title="Voices of NYEKUSA"
                    description="Hear from members and alumni about the lasting impact of our community."
                />

                {error && (
                    <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
                        {error} - Showing fallback testimonials
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-6">
                    {displayTestimonials.map((testimonial, index) => {
                        const styles = getTestimonialStyles(index);
                        return (
                            <div
                                key={testimonial.id}
                                className="relative bg-background rounded-xl border border-border/50 p-7 hover:border-primary/20 hover:shadow-sm transition-all group"
                            >
                                {/* Brand accent line */}
                                <div
                                    className={`absolute top-0 left-7 right-7 h-px rounded-full ${styles.accent}`}
                                    aria-hidden="true"
                                />

                                <QuoteIcon className="mb-4 opacity-30 text-foreground/20" />

                                <p className="text-foreground/80 text-sm leading-relaxed mb-6 font-body italic line-clamp-4">
                                    &quot;{testimonial.quote}&quot;
                                </p>

                                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                                    <div
                                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-heading ${styles.avatar}`}
                                        aria-hidden="true"
                                    >
                                        {testimonial.full_name?.charAt(0) || '?'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-body font-semibold text-sm text-foreground truncate">
                                            {testimonial.full_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {testimonial.role}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
