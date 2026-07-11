"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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

const CATEGORY_LABELS: Record<string, string> = {
    meetings: "Thursday Meetings",
    hiking: "Hikes",
    ceremony: "Ceremonies",
    social: "Social Events",
    induction: "Induction",
    outreach: "Outreach",
};

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

function formatDate(dateStr: string) {
    const date = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export default function ClientGalleryPage() {
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

    const sortedAlbums = [...albums].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const categories = [...new Set(sortedAlbums.map(album => album.category).filter(Boolean))];
    const filteredAlbums = categoryFilter
        ? sortedAlbums.filter(album => album.category === categoryFilter)
        : sortedAlbums;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Photo Gallery</h2>
                <p className="text-slate-500 mt-1">
                    Relive the moments that define our community — events, activities, and campus life.
                </p>
            </div>

            <div className="border-t border-slate-100 pt-6">
                {/* Category Filter */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <button
                        onClick={() => setCategoryFilter("")}
                        className={`px-5 py-2 text-sm font-medium rounded-full border transition-colors ${
                            !categoryFilter
                                ? "bg-emerald-800 text-white border-emerald-800"
                                : "bg-white text-slate-600 border-slate-200 hover:border-emerald-800/40 hover:text-slate-900"
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
                                    ? "bg-emerald-800 text-white border-emerald-800"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-emerald-800/40 hover:text-slate-900"
                            }`}
                            aria-pressed={categoryFilter === category}
                        >
                            {getCategoryLabel(category)}
                        </button>
                    ))}
                </div>

                {!loading && (
                    <p className="text-sm text-slate-500 mb-6 font-medium">
                        {filteredAlbums.length} album{filteredAlbums.length === 1 ? "" : "s"}
                    </p>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200/60 animate-pulse">
                                <div className="h-48 bg-slate-100 rounded-t-2xl" />
                                <div className="p-4 space-y-2">
                                    <div className="h-5 bg-slate-100 rounded w-2/3" />
                                    <div className="h-4 bg-slate-100 rounded w-full" />
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
                                className="group block bg-white rounded-2xl border border-slate-200/60 overflow-hidden hover:border-emerald-700/20 transition-all hover:shadow-md"
                            >
                                <div className="h-48 overflow-hidden relative bg-slate-100">
                                    <Image
                                        src={album.cover_image || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop"}
                                        alt={album.title}
                                        width={600}
                                        height={400}
                                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                                        priority={false}
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-emerald-950/0 group-hover:bg-emerald-950/60 transition-colors duration-300 flex items-center justify-center">
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 inline-flex items-center gap-1.5 text-white font-semibold text-sm">
                                            View Album <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <span className="inline-block px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide rounded-full bg-emerald-50 text-emerald-800">
                                        {getCategoryBadge(album.category)}
                                    </span>
                                    <h3 className="font-heading text-base font-bold text-slate-800 mt-2">
                                        {album.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 font-medium">
                                        {formatDate(album.date)}
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
                        <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No albums in this category yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
