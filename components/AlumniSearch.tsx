"use client";

import React, { useState } from "react";
import { Search, Mail, GraduationCap, FileSearch, Users, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AlumniType } from "@/app/(website)/alumni/page";

interface AlumniSearchProps {
    initialAlumni: AlumniType[];
}

// ─── LinkedIn icon (simple SVG since lucide doesn't include it) ──────────────
function LinkedInIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            aria-hidden="true"
        >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    );
}

// ─── Empty state variants ────────────────────────────────────────────────────

function EmptyDB() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
                <Users className="w-7 h-7 text-muted-foreground/50" />
            </div>
            <p className="text-base font-medium text-foreground mb-1">No alumni profiles yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">
                Alumni profiles will appear here once members graduate and join the network.
            </p>
        </div>
    );
}

function EmptySearch({ query, onClear }: { query: string; onClear: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
                <FileSearch className="w-7 h-7 text-muted-foreground/50" />
            </div>
            <p className="text-base font-medium text-foreground mb-1">
                No results for{" "}
                <span className="font-semibold">"{query}"</span>
            </p>
            <p className="text-sm text-muted-foreground max-w-xs mb-5">
                Try a different name, course, or keyword.
            </p>
            <button
                onClick={onClear}
                className="text-sm font-medium text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
            >
                Clear search
            </button>
        </div>
    );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function AlumniSearch({ initialAlumni }: AlumniSearchProps) {
    const [search, setSearch] = useState("");

    const trimmed = search.trim();

    const filtered = initialAlumni.filter((person) =>
        !trimmed ||
        person.full_name?.toLowerCase().includes(trimmed.toLowerCase()) ||
        person.course?.toLowerCase().includes(trimmed.toLowerCase()) ||
        person.bio?.toLowerCase().includes(trimmed.toLowerCase())
    );

    const isEmpty = initialAlumni.length === 0;
    const noResults = !isEmpty && filtered.length === 0 && trimmed.length > 0;

    return (
        <>
            {/* Search bar — hidden when DB is empty */}
            {!isEmpty && (
                <div className="relative max-w-md mb-10">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Search by name, course, or profession…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-9"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            aria-label="Clear search"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            {/* Result count */}
            {!isEmpty && filtered.length > 0 && trimmed && (
                <p className="text-xs text-muted-foreground mb-6">
                    {filtered.length} {filtered.length === 1 ? "alumni" : "alumni"} found
                </p>
            )}

            {/* Empty: no data in DB */}
            {isEmpty && <EmptyDB />}

            {/* Empty: search returned nothing */}
            {noResults && <EmptySearch query={trimmed} onClear={() => setSearch("")} />}

            {/* Grid */}
            {filtered.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-6">
                    {filtered.map((person) => (
                        <div
                            key={person.id}
                            className="bg-card rounded-xl border border-border/50 p-6 hover:border-primary/20 transition-colors"
                        >
                            <div className="flex gap-4">
                                <div className="w-14 h-14 rounded-full overflow-hidden bg-muted shrink-0 border border-border">
                                    {person.photo_url ? (
                                        <img
                                            src={person.photo_url}
                                            alt={person.full_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-lg font-heading font-bold text-muted-foreground">
                                            {person.full_name?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-body font-semibold text-foreground">
                                        {person.full_name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                        <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                                        {person.course}
                                        {person.admission_year && (
                                            <span>· Class of {person.admission_year + 4}</span>
                                        )}
                                    </p>
                                    {person.bio && (
                                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                                            {person.bio}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-3 mt-3">
                                        {person.linkedin_url && (
                                            <a
                                                href={person.linkedin_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`${person.full_name} on LinkedIn`}
                                                className="text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                <LinkedInIcon className="w-4 h-4" />
                                            </a>
                                        )}
                                        {person.email && (
                                            <a
                                                href={`mailto:${person.email}`}
                                                aria-label={`Email ${person.full_name}`}
                                                className="text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                <Mail className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}