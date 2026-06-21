"use client";

import { useState } from "react";
import { Search, Download, FileText, BookOpen, File, FileSpreadsheet, FolderOpen, SearchX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const categoryLabels = {
    nyekusa_docs: "NYEKUSA DOCS",
    dkut: "DeKUT",
    guides: "Guides",
    templates: "Templates",
    other: "Other",
} as const;

const categoryIcons = {
    nyekusa_docs: BookOpen,
    dkut: FileSpreadsheet,
    guides: FileText,
    templates: File,
    other: File,
} as const;

type ResourceCategory = keyof typeof categoryLabels;
type Resource = {
    id: string;
    title: string;
    description?: string | null;
    file_url?: string | null;
    file_type?: string | null;
    category: ResourceCategory | string;
    department?: string | null;
    download_count: number;
};

type ResourcesClientProps = {
    initialResources?: Resource[];
};

export default function ResourcesClient({ initialResources = [] }: ResourcesClientProps) {
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState("");

    // Resources scoped to the selected category, before search is applied.
    // Lets us tell "this tab is empty" apart from "search found nothing".
    const inCategory = initialResources.filter(
        (r) => !catFilter || r.category === catFilter
    );

    const filtered = inCategory.filter((r) => {
        const matchSearch =
            !search ||
            r.title?.toLowerCase().includes(search.toLowerCase()) ||
            r.description?.toLowerCase().includes(search.toLowerCase());
        return matchSearch;
    });

    const hasAnyResources = initialResources.length > 0;
    const categoryIsEmpty = hasAnyResources && inCategory.length === 0;
    const searchHasNoMatches = inCategory.length > 0 && filtered.length === 0;

    const clearSearch = () => setSearch("");
    const clearFilters = () => {
        setSearch("");
        setCatFilter("");
    };

    return (
        <section className="py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-10">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search resources..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                            aria-label="Search resources"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setCatFilter("")}
                            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                                !catFilter
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            All
                        </button>
                        {Object.entries(categoryLabels).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setCatFilter(key)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                                    catFilter === key
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Resources List */}
                {filtered.length > 0 ? (
                    <div className="space-y-3">
                        {filtered.map((resource) => {
                            const Icon = categoryIcons[resource.category as ResourceCategory] || File;
                            return (
                                <div
                                    key={resource.id}
                                    className="bg-card rounded-xl border border-border/50 p-5 hover:border-primary/20 transition-colors flex items-start gap-4"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
                                        <Icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-body font-semibold text-foreground">{resource.title}</h3>
                                        {resource.description && (
                                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-1">
                                                {resource.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            {resource.department && <span>{resource.department}</span>}
                                            {resource.file_type && <span>{resource.file_type}</span>}
                                            {resource.download_count > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <Download className="w-3 h-3" /> {resource.download_count} downloads
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {resource.file_url && (
                                        // Routed through the API so download_count stays accurate —
                                        // it increments the counter server-side, then redirects to
                                        // the actual file.
                                        <a
                                            href={`/api/resources/${resource.id}/download`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button size="sm" variant="outline" className="shrink-0">
                                                <Download className="w-3.5 h-3.5 mr-1.5" /> Download
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : searchHasNoMatches ? (
                    <div className="text-center py-16">
                        <SearchX className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground">
                            No resources match <span className="font-medium text-foreground">&ldquo;{search}&rdquo;</span>.
                        </p>
                        <Button variant="link" onClick={clearSearch} className="mt-1">
                            Clear search
                        </Button>
                    </div>
                ) : categoryIsEmpty ? (
                    <div className="text-center py-16">
                        <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground">
                            No resources in {categoryLabels[catFilter as ResourceCategory] || "this category"} yet.
                        </p>
                        <Button variant="link" onClick={clearFilters} className="mt-1">
                            View all resources
                        </Button>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground">No resources available yet.</p>
                    </div>
                )}
            </div>
        </section>
    );
}