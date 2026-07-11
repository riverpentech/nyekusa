"use client";

import React, { useState, useEffect } from "react";
import { Search, GraduationCap, Filter, Users, SearchX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type Member = {
    id: string;
    full_name?: string;
    course?: string;
    department?: string;
    year_of_study?: string;
    quotes?: string;
    photo_url?: string;
};

export default function DashboardMembersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [courseFilter, setCourseFilter] = useState("");
    const [error, setError] = useState<string | null>(null);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch("/api/members?status=active&limit=100");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json() as Member[];
            setMembers(data);
        } catch (err) {
            console.error("Failed to fetch members:", err);
            setError("Failed to load members. Please try again later.");
            setMembers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        queueMicrotask(() => { void fetchMembers(); });
    }, []);

    const courses = [...new Set(members.map((m) => m.course).filter(Boolean))];
    const years = [...new Set(members.map((m) => m.year_of_study).filter(Boolean))];

    const filtered = members.filter((m) => {
        const matchSearch =
            !search ||
            m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            m.course?.toLowerCase().includes(search.toLowerCase()) ||
            m.quotes?.toLowerCase().includes(search.toLowerCase());
        const matchYear = !yearFilter || m.year_of_study === yearFilter;
        const matchCourse = !courseFilter || m.course === courseFilter;
        return matchSearch && matchYear && matchCourse;
    });

    const filtersActive = Boolean(search || yearFilter || courseFilter);
    const hasAnyMembers = members.length > 0;
    const noMatchesFromFilters = hasAnyMembers && filtersActive && filtered.length === 0;

    const clearFilters = () => { setSearch(""); setYearFilter(""); setCourseFilter(""); };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Members</h2>
                <p className="text-slate-500 mt-1">
                    Meet the vibrant community of students that make NYEKUSA great.
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                    <button
                        onClick={fetchMembers}
                        className="ml-3 text-red-600 hover:text-red-800 underline font-medium"
                    >
                        Retry
                    </button>
                </div>
            )}

            {!loading && hasAnyMembers && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, course, or skill..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                            aria-label="Search members"
                        />
                    </div>
                    <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground"
                        aria-label="Filter by year"
                    >
                        <option value="">All Years</option>
                        {years.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                        className="h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground"
                        aria-label="Filter by course"
                    >
                        <option value="">All Courses</option>
                        {courses.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            )}

            {!loading && filtered.length > 0 && (
                <p className="text-sm text-muted-foreground">
                    {filtered.length} {filtered.length === 1 ? "member" : "members"}
                </p>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-card rounded-xl border border-border/50 p-4 flex items-center gap-4 animate-pulse">
                            <div className="w-6 h-4 bg-muted rounded shrink-0" />
                            <div className="w-12 h-12 rounded-full bg-muted shrink-0" />
                            <div className="flex-1 min-w-0 space-y-2">
                                <div className="h-4 bg-muted rounded w-1/3" />
                                <div className="h-3 bg-muted rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length > 0 ? (
                <div className="space-y-3">
                    {filtered.map((member, index) => (
                        <div
                            key={member.id}
                            className="bg-card rounded-xl border border-border/50 p-4 flex items-center gap-4 hover:border-primary/20 transition-colors"
                        >
                            <span className="w-6 shrink-0 text-sm font-medium text-muted-foreground text-right tabular-nums">
                                {index + 1}
                            </span>
                            <div className="w-12 h-12 shrink-0 rounded-full overflow-hidden bg-muted border border-border relative">
                                {member.photo_url ? (
                                    <Image
                                        src={member.photo_url}
                                        alt={member.full_name || "Member avatar"}
                                        fill
                                        className="object-cover"
                                        sizes="48px"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-base font-heading font-bold text-muted-foreground">
                                        {member.full_name?.charAt(0) || "M"}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-body font-semibold text-foreground truncate">
                                    {member.full_name || "Unknown Member"}
                                </h3>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <GraduationCap className="w-3.5 h-3.5" /> {member.course || "No course"}
                                    </span>
                                </div>
                            </div>
                            {member.quotes && (
                                <div className="hidden sm:flex flex-wrap justify-end gap-1.5 shrink-0 max-w-[40%]">
                                    {member.quotes.split(",").slice(0, 3).map((quote) => (
                                        <span key={quote.trim()} className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full whitespace-nowrap">
                                            {quote.trim()}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : noMatchesFromFilters ? (
                <div className="text-center py-16">
                    <SearchX className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No members match your search criteria.</p>
                    <Button variant="link" onClick={clearFilters} className="mt-1">Clear filters</Button>
                </div>
            ) : members.length === 0 ? (
                <div className="text-center py-16">
                    <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No members to show yet.</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Check back soon as the community grows.</p>
                </div>
            ) : (
                <div className="text-center py-16">
                    <Filter className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No members match your search criteria.</p>
                </div>
            )}
        </div>
    );
}
