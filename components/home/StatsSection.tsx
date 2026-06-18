import React from "react";

const stats = [
    { value: "100+", label: "Active Members", sub: "Contributing to NYEKUSA" },
    { value: "200+", label: "Alumni Network", sub: "Working professionals" },
    { value: "40+", label: "Events Held", sub: "Since founding" },
    { value: "7+", label: "Years Active", sub: "Bringing our community together" },
];

export default function StatsSection() {
    return (
        <section className="py-16 border-y border-border/60 bg-card">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, i) => (
                        <div key={stat.label} className="text-center">
                            <div
                                className={`w-8 h-1 rounded-full mx-auto mb-4 ${
                                    i === 0 ? "bg-primary" :
                                        i === 1 ? "bg-secondary" :
                                            i === 2 ? "bg-destructive" :
                                                "bg-primary"
                                }`}
                            />
                            <p className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                                {stat.value}
                            </p>
                            <p className="text-sm font-semibold text-foreground/80 mt-1">{stat.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}