"use client"

import ComingSoon from "@/components/shared/ComingSoon";
import { CalendarDays } from "lucide-react";

export default function EventsPage() {
    return (
        <ComingSoon
            moduleName="NYEKUSA Events | Workshops, Hikes, Networking, Mentorship & Thursday Experience"
            description="Stay updated with our upcoming events, mentorship programs, hikes, community engagement activities and more."
            eta="June 2026"
            icon={<CalendarDays />}
        />
    );
}

/*
import React, { useState, useEffect } from "react";
import PageHero from "@/components/shared/PageHero";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

// Type definitions
interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    venue: string;
    category: keyof typeof categoryColors | "other";
    status: "upcoming" | "ongoing" | "completed";
    cover_image: string;
}

const categoryColors = {
    social: "bg-amber-50 text-amber-700 border-amber-200",
    academic: "bg-blue-50 text-blue-700 border-blue-200",
    sports: "bg-orange-50 text-orange-700 border-orange-200",
    cultural: "bg-purple-50 text-purple-700 border-purple-200",
    career: "bg-emerald-50 text-emerald-700 border-emerald-200",
    community: "bg-teal-50 text-teal-700 border-teal-200",
    other: "bg-muted text-muted-foreground border-border"
} as const;

// Utility functions for date formatting
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    }).format(date);
};

const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(date);
};

// Sample data (would come from API in production)
const sampleEvents: Event[] = [
    {
        id: "1",
        title: "Freshers' Welcome Night 2025",
        description: "A grand welcome event for all first-year students from Nyeri County. Enjoy music, food, games, and meet your fellow community members.",
        date: "2025-02-15T18:00:00",
        venue: "DeKUT Main Hall",
        category: "social",
        status: "upcoming",
        cover_image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop"
    },
    {
        id: "2",
        title: "Career & Mentorship Workshop",
        description: "Connect with industry professionals and NYEKUSA alumni for career guidance, CV reviews, and networking opportunities.",
        date: "2025-03-01T10:00:00",
        venue: "SCC Auditorium",
        category: "career",
        status: "upcoming",
        cover_image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&h=400&fit=crop"
    },
    {
        id: "3",
        title: "Annual Sports Gala",
        description: "Compete in football, volleyball, athletics, and more. Represent your department and win exciting prizes.",
        date: "2025-03-20T08:00:00",
        venue: "University Grounds",
        category: "sports",
        status: "upcoming",
        cover_image: "https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=600&h=400&fit=crop"
    },
    {
        id: "4",
        title: "Cultural Night 2024",
        description: "A celebration of the rich culture and traditions of Nyeri County featuring music, dance, food, and storytelling.",
        date: "2024-11-10T17:00:00",
        venue: "DeKUT Main Hall",
        category: "cultural",
        status: "completed",
        cover_image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop"
    },
];

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

    useEffect(() => {
        // Simulate API call - replace with your actual data fetching
        const fetchEvents = async () => {
            try {
                // In production, this would be your API endpoint
                // const response = await fetch('/api/events');
                // const data = await response.json();
                // setEvents(data);

                // Using sample data for now
                setTimeout(() => {
                    setEvents(sampleEvents);
                    setLoading(false);
                }, 500);
            } catch (error) {
                console.error('Error fetching events:', error);
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const displayEvents = events.length > 0 ? events : sampleEvents;

    const filteredEvents = displayEvents.filter((event) => {
        if (tab === "upcoming") {
            return event.status === "upcoming" || event.status === "ongoing";
        }
        return event.status === "completed";
    });

    return (
        <div>
            <PageHero
                badge="Events"
                title="Community Events"
                description="Discover, register, and participate in events that bring the NYEKUSA community together."
            />

            <section className="py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Tabs *//*}
                    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg w-fit mb-10">
                        {["upcoming", "past"].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t as "upcoming" | "past")}
                                className={`px-5 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                                    tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {t} Events
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="grid md:grid-cols-2 gap-8">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-card rounded-xl border border-border/50 animate-pulse">
                                    <div className="h-48 bg-muted rounded-t-xl" />
                                    <div className="p-6 space-y-3">
                                        <div className="h-5 bg-muted rounded w-2/3" />
                                        <div className="h-4 bg-muted rounded w-full" />
                                        <div className="h-4 bg-muted rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredEvents.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-8">
                            {filteredEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="group bg-card rounded-xl border border-border/50 overflow-hidden hover:border-primary/20 transition-all"
                                >
                                    {event.cover_image && (
                                        <div className="h-48 overflow-hidden">
                                            <img
                                                src={event.cover_image}
                                                alt={event.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${categoryColors[event.category] || categoryColors.other}`}>
                        {event.category}
                      </span>
                                            {event.status === "upcoming" && (
                                                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                          Upcoming
                        </span>
                                            )}
                                        </div>
                                        <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                                            {event.title}
                                        </h3>
                                        {event.description && (
                                            <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                                                {event.description}
                                            </p>
                                        )}
                                        <div className="space-y-1.5 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 shrink-0" />
                                                {formatDate(event.date)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                                {formatTime(event.date)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                                {event.venue}
                                            </div>
                                        </div>
                                        {event.status === "upcoming" && (
                                            <Button className="mt-5 w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                                                Register for Event
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground">No {tab} events at the moment. Check back soon!</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}*/