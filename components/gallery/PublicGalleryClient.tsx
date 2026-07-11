"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
    ChevronLeft, 
    ChevronRight, 
    X, 
    Image as ImageIcon,
    Calendar,
    Folder
} from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import { Badge } from "@/components/ui/badge";

type GalleryImage = {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    createdAt: Date;
    updatedAt: Date;
};

type Props = {
    initialImages: GalleryImage[];
};

const CATEGORIES = [
    { value: "meetings", label: "Thursday Meetings", badge: "Meeting" },
    { value: "hiking", label: "Hikes", badge: "Hike" },
    { value: "ceremony", label: "Ceremonies", badge: "Ceremony" },
    { value: "social", label: "Social Events", badge: "Social" },
    { value: "induction", label: "Induction", badge: "Induction" },
    { value: "outreach", label: "Outreach", badge: "Outreach" },
    { value: "other", label: "Other", badge: "Other" }
];

function getCategoryLabel(cat: string | null) {
    if (!cat) return "Other";
    const found = CATEGORIES.find(c => c.value === cat);
    return found ? found.label : cat.charAt(0).toUpperCase() + cat.slice(1);
}

function getCategoryBadge(cat: string | null) {
    if (!cat) return "Other";
    const found = CATEGORIES.find(c => c.value === cat);
    return found ? found.badge : cat.charAt(0).toUpperCase() + cat.slice(1);
}

export default function PublicGalleryClient({ initialImages }: Props) {
    const [images, setImages] = useState<GalleryImage[]>(initialImages);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    const categories = [...new Set(images.map(img => img.category).filter(Boolean))];
    
    const filteredImages = categoryFilter
        ? images.filter(img => img.category === categoryFilter)
        : images;

    // Lightbox navigation
    const openLightbox = (index: number) => {
        setSelectedImageIndex(index);
    };

    const closeLightbox = () => {
        setSelectedImageIndex(null);
    };

    const navigateLightbox = (direction: "prev" | "next") => {
        if (selectedImageIndex === null) return;
        
        let newIndex = selectedImageIndex;
        if (direction === "prev") {
            newIndex = selectedImageIndex > 0 ? selectedImageIndex - 1 : filteredImages.length - 1;
        } else {
            newIndex = selectedImageIndex < filteredImages.length - 1 ? selectedImageIndex + 1 : 0;
        }
        setSelectedImageIndex(newIndex);
    };

    // Keyboard controls for lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedImageIndex === null) return;
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowLeft") navigateLightbox("prev");
            if (e.key === "ArrowRight") navigateLightbox("next");
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedImageIndex, filteredImages]);

    const activeImage = selectedImageIndex !== null ? filteredImages[selectedImageIndex] : null;

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
                                onClick={() => setCategoryFilter(category!)}
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

                    <p className="text-sm text-muted-foreground mb-10 font-medium">
                        {filteredImages.length} image{filteredImages.length === 1 ? "" : "s"}
                    </p>

                    {/* Image Grid */}
                    {filteredImages.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredImages.map((image, index) => (
                                <div
                                    key={image.id}
                                    onClick={() => openLightbox(index)}
                                    className="group cursor-pointer bg-card rounded-2xl border border-border/50 overflow-hidden hover:border-primary/20 transition-all hover:shadow-lg flex flex-col justify-between"
                                >
                                    <div className="h-52 overflow-hidden relative select-none">
                                        <Image
                                            src={image.url}
                                            alt={image.title}
                                            width={600}
                                            height={400}
                                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                                            priority={index < 6}
                                            unoptimized
                                            onContextMenu={(e) => e.preventDefault()}
                                            onDragStart={(e) => e.preventDefault()}
                                        />
                                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/70 transition-colors duration-300 flex items-center justify-center">
                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 inline-flex items-center gap-1.5 text-white font-medium text-sm">
                                                Enlarge View
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 select-none">
                                        <span className="inline-block px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide rounded-full bg-primary/10 text-primary">
                                            {getCategoryBadge(image.category)}
                                        </span>
                                        <h3 className="font-heading text-lg font-bold text-primary mt-3 line-clamp-1">
                                            {image.title}
                                        </h3>
                                        {image.description && (
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {image.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground font-medium">No images in this category yet.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Lightbox / Enlarged Preview Modal */}
            {activeImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200 select-none">
                    {/* Close Button */}
                    <button 
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 z-50 text-white/70 hover:text-white rounded-full p-2 bg-white/10 hover:bg-white/20 transition-colors"
                        aria-label="Close preview"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {/* Navigation Left */}
                    <button 
                        onClick={() => navigateLightbox("prev")}
                        className="absolute left-4 z-40 text-white/70 hover:text-white rounded-full p-3 bg-white/5 hover:bg-white/10 transition-colors"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </button>

                    {/* Image Panel */}
                    <div className="w-full max-w-5xl px-4 flex flex-col md:flex-row items-center gap-6 justify-center max-h-[90vh]">
                        {/* Enlarged Image container */}
                        <div className="relative w-full md:w-3/5 h-[50vh] md:h-[70vh] flex items-center justify-center">
                            <Image
                                src={activeImage.url}
                                alt={activeImage.title}
                                fill
                                className="object-contain max-w-full max-h-full"
                                sizes="(max-w-768px) 100vw, 60vw"
                                onContextMenu={(e) => e.preventDefault()}
                                onDragStart={(e) => e.preventDefault()}
                                priority
                                unoptimized
                            />
                        </div>

                        {/* Metadata Details panel */}
                        <div className="w-full md:w-2/5 max-w-md bg-zinc-900/50 p-6 rounded-2xl border border-white/10 text-white/90 space-y-4">
                            <div>
                                <span className="inline-block px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide rounded-full bg-emerald-500/20 text-emerald-400">
                                    {getCategoryBadge(activeImage.category)}
                                </span>
                                <h3 className="font-heading text-xl font-bold mt-3 text-white">
                                    {activeImage.title}
                                </h3>
                                <div className="h-px bg-white/10 my-3" />
                                {activeImage.description ? (
                                    <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                                        {activeImage.description}
                                    </p>
                                ) : (
                                    <p className="text-sm text-zinc-500 italic">No description provided.</p>
                                )}
                            </div>

                            <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-zinc-400 font-medium">
                                <div className="flex items-center gap-2">
                                    <Folder className="h-3.5 w-3.5" />
                                    <span>Category: {getCategoryLabel(activeImage.category)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>Uploaded: {new Date(activeImage.createdAt).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric"
                                    })}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Right */}
                    <button 
                        onClick={() => navigateLightbox("next")}
                        className="absolute right-4 z-40 text-white/70 hover:text-white rounded-full p-3 bg-white/5 hover:bg-white/10 transition-colors"
                        aria-label="Next image"
                    >
                        <ChevronRight className="h-8 w-8" />
                    </button>
                </div>
            )}
        </div>
    );
}
