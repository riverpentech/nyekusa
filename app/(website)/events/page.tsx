"use client";

import React, { useState, useEffect } from "react";
import PageHero from "@/components/shared/PageHero";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

// Type definitions
interface EventType {
    id: string;
    title: string;
    description: string | null;
    eventDate: string;
    location: string;
    image: string | null;
}

const categoryColors: Record<string, string> = {
    social: "bg-amber-50 text-amber-700 border-amber-200",
    academic: "bg-blue-50 text-blue-700 border-blue-200",
    sports: "bg-orange-50 text-orange-700 border-orange-200",
    cultural: "bg-purple-50 text-purple-700 border-purple-200",
    career: "bg-emerald-50 text-emerald-700 border-emerald-200",
    community: "bg-teal-50 text-teal-700 border-teal-200",
    other: "bg-slate-50 text-slate-700 border-slate-200"
};

// Utility functions for date formatting
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    }).format(date);
};

const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(date);
};

const getCategory = (title: string): string => {
    const lower = title.toLowerCase();
    if (lower.includes("hike") || lower.includes("sports") || lower.includes("gala") || lower.includes("run")) return "sports";
    if (lower.includes("career") || lower.includes("mentorship") || lower.includes("workshop") || lower.includes("job") || lower.includes("cv")) return "career";
    if (lower.includes("cultural") || lower.includes("culture") || lower.includes("tradition")) return "cultural";
    if (lower.includes("induction") || lower.includes("welcome") || lower.includes("freshers")) return "social";
    return "social";
};

const getStatus = (dateStr: string): "upcoming" | "completed" => {
    return new Date(dateStr) < new Date() ? "completed" : "upcoming";
};

export default function EventsPage() {
    const [events, setEvents] = useState<EventType[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
    const [error, setError] = useState<string | null>(null);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/events?limit=100');
            if (!response.ok) {
                throw new Error('Failed to fetch events data');
            }
            const data = await response.json();
            setEvents(data.events || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('Failed to load events. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const filteredEvents = events.filter((event) => {
        const status = getStatus(event.eventDate);
        if (tab === "upcoming") {
            return status === "upcoming";
        }
        return status === "completed";
    });

    return (
        <div>
            <PageHero
                badge="Events"
                title="Community Events"
                description="Discover, register, and participate in events that bring the NYEKUSA community together."
            />

            <section className="py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                    {/* Tabs */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-fit">
                        {(["upcoming", "past"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`px-5 py-2 text-sm font-semibold rounded-md transition-colors capitalize ${
                                    tab === t 
                                        ? "bg-white text-slate-900 shadow-sm" 
                                        : "text-slate-500 hover:text-slate-900"
                                }`}
                            >
                                {t} Events
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 text-red-800 text-sm font-medium border border-red-200">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-xl border border-slate-200/60 animate-pulse h-[350px]" />
                            ))}
                        </div>
                    ) : filteredEvents.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredEvents.map((event) => {
                                const category = getCategory(event.title);
                                const catColor = categoryColors[category] || categoryColors.other;
                                const status = getStatus(event.eventDate);
                                return (
                                    <div
                                        key={event.id}
                                        className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="h-44 bg-slate-100 overflow-hidden relative">
                                                {event.image ? (
                                                    <img
                                                        src={event.image}
                                                        alt={event.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-emerald-50/50 text-emerald-800">
                                                        <Calendar className="w-8 h-8 opacity-40" />
                                                    </div>
                                                )}
                                                <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-md border bg-white border-slate-200 text-slate-800 shadow-sm capitalize">
                                                    {category}
                                                </span>
                                            </div>
                                            <div className="p-5 space-y-3">
                                                <h3 className="font-heading text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                                                    {event.title}
                                                </h3>
                                                {event.description && (
                                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                                                        {event.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-5 pt-0 space-y-3">
                                            <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    {formatDate(event.eventDate)}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    {formatTime(event.eventDate)}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    {event.location}
                                                </div>
                                            </div>
                                            {status === "upcoming" && (
                                                <Button className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-semibold" size="sm">
                                                    Register for Event
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h4 className="font-semibold text-slate-700">No events found</h4>
                            <p className="text-xs text-slate-400 mt-1">There are no {tab} events scheduled at the moment.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}