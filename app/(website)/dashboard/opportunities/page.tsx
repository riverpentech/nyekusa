"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ExternalLink, Clock, Building, MapPin, Briefcase, Search, X, FileSearch, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOpportunities } from "@/modules/opportunities/opportunities.client";

const categoryLabels = {
    internship: "Internship",
    scholarship: "Scholarship",
    attachment: "Attachment",
    competition: "Competition",
    job: "Job",
    hackathon: "Hackathon",
    other: "Other",
} as const;

const categoryStyles = {
    internship: "bg-blue-50 text-blue-700",
    scholarship: "bg-purple-50 text-purple-700",
    attachment: "bg-teal-50 text-teal-700",
    competition: "bg-orange-50 text-orange-700",
    job: "bg-emerald-50 text-emerald-700",
    hackathon: "bg-pink-50 text-pink-700",
    other: "bg-muted text-muted-foreground",
} as const;

type OpportunityCategory = keyof typeof categoryLabels;
type Opportunity = {
    id: string;
    title: string;
    company?: string;
    location?: string;
    category: OpportunityCategory;
    deadline: string;
    description?: string;
    apply_url?: string;
};

const getDaysRemaining = (deadlineDate: string) => {
    const now = new Date();
    const deadline = new Date(deadlineDate);
    return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

type EmptyStateProps =
    | { reason: "empty-db" }
    | { reason: "no-category-results"; category: OpportunityCategory; onReset: () => void }
    | { reason: "no-search-results"; query: string; onReset: () => void; onClearCategory?: () => void; hasCategory: boolean };

function EmptyState(props: EmptyStateProps) {
    if (props.reason === "empty-db") {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
                    <FolderOpen className="w-7 h-7 text-muted-foreground/50" />
                </div>
                <p className="text-base font-medium text-foreground mb-1">No opportunities yet</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                    Check back soon — new internships, scholarships, and more are added regularly.
                </p>
            </div>
        );
    }

    if (props.reason === "no-category-results") {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
                    <Briefcase className="w-7 h-7 text-muted-foreground/50" />
                </div>
                <p className="text-base font-medium text-foreground mb-1">
                    No{" "}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${categoryStyles[props.category]}`}>
                        {categoryLabels[props.category]}
                    </span>{" "}
                    opportunities right now
                </p>
                <p className="text-sm text-muted-foreground max-w-xs mb-5">
                    Nothing in this category at the moment. New listings are added regularly.
                </p>
                <button
                    onClick={props.onReset}
                    className="text-sm font-medium text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                >
                    View all opportunities
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
                <FileSearch className="w-7 h-7 text-muted-foreground/50" />
            </div>
            <p className="text-base font-medium text-foreground mb-1">
                No results for <span className="font-semibold">"{props.query}"</span>
            </p>
            <p className="text-sm text-muted-foreground max-w-xs mb-5">
                Try different keywords{props.hasCategory ? ", or clear the category filter" : ""}.
            </p>
            <div className="flex items-center gap-3">
                <button
                    onClick={props.onReset}
                    className="text-sm font-medium text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                >
                    Clear search
                </button>
                {props.hasCategory && (
                    <>
                        <span className="text-muted-foreground/40">·</span>
                        <button
                            onClick={props.onClearCategory}
                            className="text-sm font-medium text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                        >
                            Remove filter
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default function DashboardOpportunitiesPage() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState<OpportunityCategory | "">("");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [error, setError] = useState<string | null>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 250);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        let isMounted = true;
        const fetchOpportunities = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getOpportunities({ is_active: true, limit: 50, sort: "-created_date" }) as Opportunity[];
                if (isMounted) setOpportunities(data || []);
            } catch (err) {
                console.error("Failed to fetch opportunities:", err);
                if (isMounted) setError("Failed to load opportunities. Please try again later.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchOpportunities();
        return () => { isMounted = false; };
    }, []);

    const filteredOpportunities = useMemo(() => {
        let list = opportunities;
        if (categoryFilter) list = list.filter((o) => o.category === categoryFilter);
        if (debouncedQuery) {
            const q = debouncedQuery.toLowerCase();
            list = list.filter(
                (o) =>
                    o.title.toLowerCase().includes(q) ||
                    o.company?.toLowerCase().includes(q) ||
                    o.location?.toLowerCase().includes(q) ||
                    o.description?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [opportunities, categoryFilter, debouncedQuery]);

    const categories = useMemo(() => Object.keys(categoryLabels) as OpportunityCategory[], []);
    const handleCategoryFilter = useCallback((cat: OpportunityCategory | "") => setCategoryFilter(cat), []);
    const clearSearch = useCallback(() => { setSearchQuery(""); searchRef.current?.focus(); }, []);
    const clearAll = useCallback(() => { setSearchQuery(""); setCategoryFilter(""); }, []);

    const emptyStateReason = useMemo((): EmptyStateProps | null => {
        if (filteredOpportunities.length > 0) return null;
        if (opportunities.length === 0) return { reason: "empty-db" };
        if (debouncedQuery) return {
            reason: "no-search-results",
            query: debouncedQuery,
            onReset: clearSearch,
            hasCategory: !!categoryFilter,
            onClearCategory: () => setCategoryFilter(""),
        };
        if (categoryFilter) return {
            reason: "no-category-results",
            category: categoryFilter,
            onReset: () => setCategoryFilter(""),
        };
        return { reason: "empty-db" };
    }, [filteredOpportunities.length, opportunities.length, debouncedQuery, categoryFilter, clearSearch]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Opportunities</h2>
                    <p className="text-slate-500 mt-1">Internships, scholarships, competitions, and more — curated for NYEKUSA members.</p>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-card rounded-xl border border-border/50 p-6 animate-pulse">
                            <div className="h-5 bg-muted rounded w-1/3 mb-2" />
                            <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                            <div className="h-4 bg-muted rounded w-1/4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error && opportunities.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Opportunities</h2>
                    <p className="text-slate-500 mt-1">Internships, scholarships, competitions, and more — curated for NYEKUSA members.</p>
                </div>
                <div className="text-center py-16">
                    <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-destructive mb-2">{error}</p>
                    <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
                </div>
            </div>
        );
    }

    const hasActiveFilters = !!categoryFilter || !!debouncedQuery;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Opportunities</h2>
                <p className="text-slate-500 mt-1">
                    Internships, scholarships, competitions, and more — curated for NYEKUSA members.
                </p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, company, or location…"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-background border border-border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
                {searchQuery && (
                    <button
                        onClick={clearSearch}
                        aria-label="Clear search"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Category filter + result count */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => handleCategoryFilter("")}
                        className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                            !categoryFilter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryFilter(cat)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                                categoryFilter === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {categoryLabels[cat]}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    {filteredOpportunities.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                            {filteredOpportunities.length} {filteredOpportunities.length === 1 ? "result" : "results"}
                        </p>
                    )}
                    {hasActiveFilters && (
                        <button
                            onClick={clearAll}
                            className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                        >
                            <X className="w-3 h-3" /> Clear all
                        </button>
                    )}
                </div>
            </div>

            {/* Listings */}
            {filteredOpportunities.length > 0 ? (
                <div className="space-y-4">
                    {filteredOpportunities.map((opp) => {
                        const daysLeft = getDaysRemaining(opp.deadline);
                        const isExpired = daysLeft < 0;
                        return (
                            <div key={opp.id} className="bg-card rounded-xl border border-border/50 p-6 hover:border-primary/20 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${categoryStyles[opp.category] || categoryStyles.other}`}>
                                                {categoryLabels[opp.category] || opp.category}
                                            </span>
                                            {!isExpired && daysLeft <= 7 && (
                                                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-50 text-red-600">
                                                    {daysLeft} days left
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-heading text-lg font-semibold text-foreground">{opp.title}</h3>
                                        {opp.description && (
                                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-2">{opp.description}</p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                                            {opp.company && (
                                                <span className="flex items-center gap-1.5">
                                                    <Building className="w-3.5 h-3.5" /> {opp.company}
                                                </span>
                                            )}
                                            {opp.location && (
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5" /> {opp.location}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                Deadline: {formatDate(opp.deadline)}
                                            </span>
                                        </div>
                                    </div>
                                    {opp.apply_url && !isExpired && (
                                        <a href={opp.apply_url} target="_blank" rel="noopener noreferrer">
                                            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
                                                Apply <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                emptyStateReason && <EmptyState {...emptyStateReason} />
            )}
        </div>
    );
}
