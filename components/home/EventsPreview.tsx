'use client'

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";

interface Event {
    id: string;
    title: string;
    date: string;
    venue: string;
    category: keyof typeof categoryColors | "other";
}

const FALLBACK_EVENTS: Event[] = [
    { id: "1", title: "Chinga Dams Hike", date: "2026-07-15T09:00:00", venue: "Chinga Dams", category: "sports" },
    { id: "2", title: "Career & Mentorship initiative", date: "2026-07-28T10:00:00", venue: "St. Loundes Girls High School", category: "career" },
    { id: "3", title: "End of Semester Bash", date: "2026-08-07T08:00:00", venue: "School Farm", category: "social" },
];

const categoryColors = {
    social: "bg-secondary/20 text-secondary-foreground",
    academic: "bg-blue-50 text-blue-700",
    sports: "bg-orange-50 text-orange-700",
    cultural: "bg-purple-50 text-purple-700",
    career: "bg-emerald-50 text-emerald-700",
    community: "bg-accent text-accent-foreground",
    other: "bg-muted text-muted-foreground"
} as const;

const formatEventDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Invalid date";

        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(date);
    } catch {
        return "Invalid date";
    }
};

const fetchEvents = async (limit: number = 3): Promise<Event[]> => {
    try {
        const response = await fetch(`/api/events?limit=${limit}`, {
            next: { revalidate: 60 }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.events || [];
    } catch (error) {
        console.error("Failed to fetch events:", error);
        return FALLBACK_EVENTS;
    }
};

export default function EventsPreview() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadEvents = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchEvents(3);
                setEvents(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load events");
                setEvents(FALLBACK_EVENTS);
            } finally {
                setLoading(false);
            }
        };

        loadEvents();
    }, []);

    if (loading) {
        return (
            <section className="py-20 sm:py-28 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeader
                        badge="Events"
                        title="What's Happening"
                        description="Stay connected with upcoming community events and activities."
                    />
                    <div className="grid md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-card rounded-xl border border-border/50 p-6 animate-pulse">
                                <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                                <div className="h-4 bg-muted rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    const displayEvents = events.length > 0 ? events : FALLBACK_EVENTS;

    return (
        <section className="py-20 sm:py-28 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader
                    badge="Events"
                    title="What's Happening"
                    description="Stay connected with upcoming community events and activities."
                />

                {error && (
                    <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
                        {error} - Showing fallback events
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    {displayEvents.map((event) => (
                        <Link
                            key={event.id}
                            href={`/events/${event.id}`} // More specific route
                            className="group bg-card rounded-xl border border-border/50 p-6 hover:border-primary/20 hover:shadow-sm transition-all"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${categoryColors[event.category] || categoryColors.other}`}>
                                    {event.category}
                                </span>
                            </div>
                            <h3 className="font-heading text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                {event.title}
                            </h3>
                            <div className="space-y-1.5 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">{formatEventDate(event.date)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">{event.venue}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="text-center">
                    <Link href="/events">
                        <Button variant="outline" className="font-medium">
                            View All Events <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}