'use client';

import React, { useState, useEffect, useCallback } from "react";
import PageHero from "@/components/shared/PageHero";
import { GitBranch, ExternalLink, Code2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const categoryStyles = {
    welfare: "bg-blue-50 text-blue-700",
    academics: "bg-purple-50 text-purple-700",
    cultural: "bg-pink-50 text-pink-700",
    outreach: "bg-teal-50 text-teal-700",
    entrepreneurship: "bg-orange-50 text-orange-700",
    other: "bg-muted text-muted-foreground",
} as const;

const categoryLabels = {
    welfare: "Welfare",
    academics: "Academics",
    cultural: "Cultural",
    outreach: "Outreach",
    entrepreneurship: "Entrepreneurship",
    other: "Other",
} as const;

type ProjectCategory = keyof typeof categoryLabels;
type Project = {
    id: string;
    title: string;
    description: string;
    team_members?: string;
    technologies?: string;
    category: ProjectCategory;
    status: "completed" | "in_progress" | string;
    github_url?: string;
    demo_url?: string;
    cover_image?: string;
};

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [catFilter, setCatFilter] = useState<ProjectCategory | "">("");
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/projects?limit=50');

            if (!response.ok) {
                throw new Error(`Failed to fetch projects: ${response.status}`);
            }

            const data = await response.json() as Project[];
            setProjects(data);
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError(err instanceof Error ? err.message : "Failed to fetch projects");
            // Fallback to sample data if API fails
            setProjects([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        queueMicrotask(() => {
            void fetchProjects();
        });
    }, [fetchProjects]);

    // Use sample data if API fails or returns empty
    const displayProjects = projects.length > 0 ? projects : [];
    const filtered = catFilter
        ? displayProjects.filter(p => p.category === catFilter)
        : displayProjects;

    return (
        <div>
            <PageHero
                badge="Innovation"
                title="Student Projects"
                description="Explore innovative projects built by NYEKUSA members, showcasing creativity and technical excellence."
            />

            <section className="py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            <p>Error loading projects: {error}</p>
                            <button
                                onClick={fetchProjects}
                                className="mt-2 text-sm text-red-600 hover:text-red-800 underline font-medium"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Category Filter */}
                    <div className="flex flex-wrap items-center gap-2 mb-10">
                        <button
                            onClick={() => setCatFilter("")}
                            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                                !catFilter
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                            aria-pressed={!catFilter}
                        >
                            All
                        </button>
                        {(Object.keys(categoryStyles) as ProjectCategory[]).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCatFilter(cat)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors capitalize ${
                                    catFilter === cat
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:text-foreground"
                                }`}
                                aria-pressed={catFilter === cat}
                            >
                                {categoryLabels[cat] || cat}
                            </button>
                        ))}
                    </div>

                    {/* Projects Grid */}
                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-card rounded-xl border border-border/50 overflow-hidden animate-pulse">
                                    <div className="h-44 bg-muted" />
                                    <div className="p-5 space-y-3">
                                        <div className="flex gap-2">
                                            <div className="h-5 w-16 bg-muted rounded-full" />
                                            <div className="h-5 w-20 bg-muted rounded-full" />
                                        </div>
                                        <div className="h-6 bg-muted rounded w-3/4" />
                                        <div className="space-y-2">
                                            <div className="h-4 bg-muted rounded w-full" />
                                            <div className="h-4 bg-muted rounded w-2/3" />
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="h-6 w-16 bg-muted rounded" />
                                            <div className="h-6 w-16 bg-muted rounded" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((project) => (
                                <div
                                    key={project.id}
                                    className="group bg-card rounded-xl border border-border/50 overflow-hidden hover:border-primary/20 hover:shadow-lg transition-all"
                                >
                                    {project.cover_image && (
                                        <div className="h-44 overflow-hidden relative bg-muted">
                                            <Image
                                                src={project.cover_image}
                                                alt={project.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                priority={filtered.indexOf(project) < 3}
                                            />
                                        </div>
                                    )}
                                    <div className="p-5">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${
                          categoryStyles[project.category] || categoryStyles.other
                      }`}>
                        {categoryLabels[project.category] || project.category}
                      </span>
                                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                                project.status === "completed"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-amber-50 text-amber-700"
                                            }`}>
                        {project.status === "completed" ? "Completed" : "In Progress"}
                      </span>
                                        </div>
                                        <h3 className="font-heading text-lg font-semibold text-foreground mb-1.5 line-clamp-1">
                                            {project.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                                            {project.description}
                                        </p>

                                        {project.technologies && (
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {project.technologies.split(",").slice(0, 4).map((tech) => (
                                                    <span key={tech.trim()} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                            {tech.trim()}
                          </span>
                                                ))}
                                                {project.technologies.split(",").length > 4 && (
                                                    <span className="text-xs text-muted-foreground">
                            +{project.technologies.split(",").length - 4}
                          </span>
                                                )}
                                            </div>
                                        )}

                                        {project.team_members && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3 line-clamp-1">
                                                <Users className="w-3 h-3 flex-shrink-0" />
                                                {project.team_members}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                                            {project.github_url && project.github_url !== "#" && (
                                                <Link
                                                    href={project.github_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                                    aria-label={`View ${project.title} on GitHub`}
                                                >
                                                    <GitBranch className="w-4 h-4" />
                                                </Link>
                                            )}
                                            {project.demo_url && project.demo_url !== "#" && (
                                                <Link
                                                    href={project.demo_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                                    aria-label={`View ${project.title} demo`}
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <Code2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground">No projects in this category yet.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
