import React from "react";

interface PageHeroProps {
    badge?: string;
    title: string;
    description?: string;
}

export default function PageHero({ badge, title, description } : PageHeroProps) {
    return (
        <section className="relative overflow-hidden py-20 sm:py-28">
            <div className="absolute inset-0 bg-linear-to-br from-accent/70 via-background to-background" />
            <div
                className="absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage: "radial-gradient(circle at 1px 1px, hsl(122 46% 23%) 1px, transparent 0)",
                    backgroundSize: "36px 36px",
                }}
            />

            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 w-64 h-64 sm:w-80 sm:h-80 opacity-[0.04] pointer-events-none select-none">
                <img
                    src="/nyekusa.svg"
                    alt=""
                    className="w-full h-full object-contain"
                />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {badge && (
                    <div className="inline-flex items-center gap-2 mb-5">
                        <span className="w-2 h-2 border-l-2 border-t-2 border-secondary" />
                        <span className="text-xs font-semibold tracking-widest uppercase text-primary font-body">
              {badge}
            </span>
                        <span className="w-2 h-2 border-r-2 border-b-2 border-secondary" />
                    </div>
                )}
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-5 text-balance leading-tight">
                    {title}
                </h1>
                {description && (
                    <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto font-body font-normal">
                        {description}
                    </p>
                )}
            </div>
        </section>
    );
}