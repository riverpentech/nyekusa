"use client";

import React, { useState } from "react";
import { Search, Mail, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import {AlumniType} from "@/app/(website)/alumni/page";

interface AlumniSearchProps {
    initialAlumni: AlumniType[];
}

function Linkedin(props: { className: string }) {
    return null;
}

export default function AlumniSearch({ initialAlumni }: AlumniSearchProps) {
    const [search, setSearch] = useState("");

    const filtered = initialAlumni.filter((person) =>
        !search ||
        person.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        person.course?.toLowerCase().includes(search.toLowerCase()) ||
        person.bio?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <div className="relative max-w-md mb-10">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search alumni by name, course, or profession..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            {filtered.length > 0 ? (
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
                                        <GraduationCap className="w-3.5 h-3.5 shrink-0" />{" "}
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
                                                className="text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                <Linkedin className="w-4 h-4" />
                                            </a>
                                        )}
                                        {person.email && (
                                            <a
                                                href={`mailto:${person.email}`}
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
            ) : (
                <div className="text-center py-16">
                    <GraduationCap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                        No alumni found matching your search.
                    </p>
                </div>
            )}
        </>
    );
}