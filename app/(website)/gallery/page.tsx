'use client'

import React, { useState, useEffect } from "react";
import Image from "next/image";
import PageHero from "@/components/shared/PageHero";
import { ArrowRight, Image as ImageIcon } from "lucide-react";

interface GalleryAlbum {
    id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    cover_image: string;
    images: string; // Google Photos album link
}

// Friendly display labels for the filter pills. Falls back to a
// capitalized version of the raw category if it isn't listed here.
const CATEGORY_LABELS: Record<string, string> = {
    meetings: "Thursday Meetings",
    hiking: "Hikes",
    ceremony: "Ceremonies",
    social: "Social Events",
    induction: "Induction",
    outreach: "Outreach",
};

// Short tag shown on each card. Falls back to the raw category.
const CATEGORY_BADGES: Record<string, string> = {
    meetings: "Meeting",
    hiking: "Hike",
    ceremony: "Ceremony",
    social: "Social",
    induction: "Induction",
    outreach: "Outreach",
};

function getCategoryLabel(category: string) {
    if (CATEGORY_LABELS[category]) return CATEGORY_LABELS[category];
    return category.charAt(0).toUpperCase() + category.slice(1);
}

function getCategoryBadge(category: string) {
    return CATEGORY_BADGES[category] ?? category;
}

// Renders "YYYY-MM-DD" as "18 June 2026"
function formatDate(dateStr: string) {
    const date = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export default function GalleryPage() {
    const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState("");

    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const response = await fetch('/api/gallery/albums');
                if (!response.ok) {
                    throw new Error('Failed to fetch albums');
                }
                const data = await response.json();
                setAlbums(data);
            } catch (error) {
                console.error('Error fetching albums:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlbums();
    }, []);

    // Newest album first
    const sortedAlbums = [...albums].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const categories = [...new Set(sortedAlbums.map(album => album.category).filter(Boolean))];
    const filteredAlbums = categoryFilter
        ? sortedAlbums.filter(album => album.category === categoryFilter)
        : sortedAlbums;

    return (
        <div>
            <PageHero
                badge="Gallery"
                title="Photo Gallery"
                description="Relive the moments that define our community — events, activities, and campus life."
            />

            <section className="py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Category Filter */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <button
                            onClick={() => setCategoryFilter("")}
                            className={`px-5 py-2 text-sm font-medium rounded-full border transition-colors ${
                                !categoryFilter
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                            }`}
                            aria-pressed={!categoryFilter}
                        >
                            All Events
                        </button>
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setCategoryFilter(category)}
                                className={`px-5 py-2 text-sm font-medium rounded-full border transition-colors ${
                                    categoryFilter === category
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                                }`}
                                aria-pressed={categoryFilter === category}
                            >
                                {getCategoryLabel(category)}
                            </button>
                        ))}
                    </div>

                    {!loading && (
                        <p className="text-sm text-muted-foreground mb-10">
                            {filteredAlbums.length} album{filteredAlbums.length === 1 ? "" : "s"}
                        </p>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-card rounded-2xl border border-border/50 animate-pulse">
                                    <div className="h-52 bg-muted rounded-t-2xl" />
                                    <div className="p-4 space-y-2">
                                        <div className="h-5 bg-muted rounded w-2/3" />
                                        <div className="h-4 bg-muted rounded w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredAlbums.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredAlbums.map((album) => (
                                <a
                                    key={album.id}
                                    href={album.images}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Open ${album.title} album on Google Photos`}
                                    className="group block bg-card rounded-2xl border border-border/50 overflow-hidden hover:border-primary/20 transition-all hover:shadow-lg"
                                >
                                    <div className="h-52 overflow-hidden relative">
                                        <Image
                                            src={album.cover_image || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop"}
                                            alt={album.title}
                                            width={600}
                                            height={400}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            priority={false}
                                            unoptimized // Remove if using a proper image CDN
                                        />
                                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/80 transition-colors duration-300 flex items-center justify-center">
                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 inline-flex items-center gap-1.5 text-white font-medium">
                                                View Album <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <span className="inline-block px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide rounded-full bg-primary/10 text-primary">
                                            {getCategoryBadge(album.category)}
                                        </span>
                                        <h3 className="font-heading text-lg font-bold text-primary mt-3">
                                            {album.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {formatDate(album.date)}
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground">No albums in this category yet.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}