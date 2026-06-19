'use client';

import React, { useState, useEffect } from 'react';
import PageHero from '@/components/shared/PageHero';
import { Mail, Users } from 'lucide-react';
import Avatar from "@/components/shared/Avatar";
import {getCurrentTermYear, getPastTermYears} from "@/lib/academicYear";

const LinkedInIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${className} hover:stroke-[#0A66C2] hover:fill-[#0A66C2] transition-colors`}
    >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const TwitterXIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${className} hover:text-[#1DA1F2] dark:hover:text-white transition-colors`}
    >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

interface Leader {
    id: string;
    full_name: string;
    position: string;
    bio?: string;
    term_year: string;
    photo_url?: string;
    order: number;
    email?: string;
    linkedin_url?: string;
    twitter_url?: string;
}

const START_YEAR = 2019;
const CURRENT_TERM_YEAR = getCurrentTermYear()
const YEAR_TABS = getPastTermYears(START_YEAR)

export default function LeadershipPage() {
    const [leaders, setLeaders] = useState<Leader[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState('current');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const response = await fetch('/api/leadership?order=order&limit=50');
                if (!response.ok) {
                    throw new Error('Failed to fetch leadership data');
                }
                const data = await response.json();
                setLeaders(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching leadership:', err);
                setError('Failed to load leadership data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaders();
    }, []);

    const filtered = selectedYear === 'current'
        ? leaders.filter((l) => l.term_year === CURRENT_TERM_YEAR)
        : leaders.filter((l) => l.term_year === selectedYear)

    const selectedLabel =
        selectedYear === 'current' ? 'the current term' : selectedYear;

    if (loading) {
        return (
            <div>
                <PageHero
                    badge="Leadership"
                    title="Our Executive Team"
                    description="The dedicated student leaders steering NYEKUSA towards its mission and vision."
                />
                <section className="py-16 sm:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="text-center animate-pulse">
                                    <div className="w-32 h-32 mx-auto mb-5 rounded-full bg-muted" />
                                    <div className="h-6 bg-muted rounded w-32 mx-auto mb-2" />
                                    <div className="h-4 bg-muted rounded w-24 mx-auto" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <PageHero
                    badge="Leadership"
                    title="Our Executive Team"
                    description="The dedicated student leaders steering NYEKUSA towards its mission and vision."
                />
                <section className="py-16 sm:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center py-12">
                            <p className="text-destructive">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div>
            <PageHero
                badge="Leadership"
                title="Our Executive Team"
                description="The dedicated student leaders steering NYEKUSA towards its mission and vision."
            />

            <section className="py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Year Filter */}
                    <div className="flex flex-wrap items-center gap-2 mb-12">
                        <button
                            onClick={() => setSelectedYear('current')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                                selectedYear === 'current'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Current Term
                        </button>
                        {YEAR_TABS.map((year) => (
                            <button
                                key={year}
                                onClick={() => setSelectedYear(year)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                                    selectedYear === year
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {year}
                            </button>
                        ))}
                    </div>

                    {/* Leaders Grid */}
                    {filtered.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filtered.map((leader) => (
                                <div key={leader.id} className="text-center">
                                    <Avatar
                                        fullName={leader.full_name}
                                        photoUrl={leader.photo_url}
                                        size="lg"
                                        className="mx-auto mb-5"
                                    />
                                    <h3 className="font-heading text-xl font-semibold text-foreground">
                                        {leader.full_name}
                                    </h3>
                                    <p className="text-sm font-medium text-primary mt-1">
                                        {leader.position}
                                    </p>
                                    {leader.bio && (
                                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xs mx-auto">
                                            {leader.bio}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-center gap-3 mt-3">
                                        {leader.linkedin_url && (
                                            <a
                                                href={leader.linkedin_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-muted-foreground transition-colors"
                                            >
                                                <LinkedInIcon className="w-4 h-4" />
                                            </a>
                                        )}
                                        {leader.twitter_url && (
                                            <a
                                                href={leader.twitter_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-muted-foreground transition-colors"
                                            >
                                                <TwitterXIcon className="w-4 h-4" />
                                            </a>
                                        )}
                                        {leader.email && (
                                            <a
                                                href={`mailto:${leader.email}`}
                                                className="text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                <Mail className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-2xl border border-dashed border-border bg-muted/30">
                            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-5">
                                <Users className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <h3 className="font-heading text-lg font-semibold text-foreground">
                                No records for {selectedLabel}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                                We don&apos;t have leadership data on file for this period yet.

                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}