import React from "react";

interface SectionHeaderProps {
    badge?: string;
    title: string;
    description?: string;
    center?: boolean;
}

export default function SectionHeader({ badge, title, description, center = true } : SectionHeaderProps) {
    return (
        <div className={`max-w-2xl ${center ? "mx-auto text-center" : ""} mb-12`}>
            {badge && (                        <div className="inline-flex items-center gap-2 mb-6">
                    <span className="w-2 h-2 border-l-2 border-t-2 border-secondary" />
                    <span className="text-xs font-semibold tracking-widest uppercase text-primary font-body">{badge}</span>
                    <span className="w-2 h-2 border-r-2 border-b-2 border-secondary" />
                </div>
            )}
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3 leading-tight">
                {title}
            </h2>
            {description && (
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed font-body">
                    {description}
                </p>
            )}
        </div>
    );
}