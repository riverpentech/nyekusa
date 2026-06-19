import React from 'react';

interface AvatarProps {
    fullName: string;
    photoUrl?: string | null;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-16 h-16 text-lg',
    lg: 'w-32 h-32 text-3xl',
    xl: 'w-40 h-40 text-4xl',
};

// Curated light-bg / dark-text pairs — keeps every combination
// readable and "on brand" instead of truly random RGB values.
const COLOR_PAIRS = [
    { bg: 'bg-rose-100', text: 'text-rose-700' },
    { bg: 'bg-orange-100', text: 'text-orange-700' },
    { bg: 'bg-amber-100', text: 'text-amber-700' },
    { bg: 'bg-lime-100', text: 'text-lime-700' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    { bg: 'bg-teal-100', text: 'text-teal-700' },
    { bg: 'bg-cyan-100', text: 'text-cyan-700' },
    { bg: 'bg-sky-100', text: 'text-sky-700' },
    { bg: 'bg-blue-100', text: 'text-blue-700' },
    { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    { bg: 'bg-violet-100', text: 'text-violet-700' },
    { bg: 'bg-purple-100', text: 'text-purple-700' },
    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700' },
    { bg: 'bg-pink-100', text: 'text-pink-700' },
];

/**
 * Deterministic hash so the same name always maps to the same
 * color pair — "random looking" across the grid, but stable
 * across reloads/re-renders for any given person.
 */
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // convert to 32-bit int
    }
    return Math.abs(hash);
}

function getInitials(fullName: string): string {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    const first = parts[0].charAt(0);
    const last = parts[parts.length - 1].charAt(0);
    return `${first}${last}`.toUpperCase();
}

function getColorPair(fullName: string) {
    const index = hashString(fullName) % COLOR_PAIRS.length;
    return COLOR_PAIRS[index];
}

export default function Avatar({
                                   fullName,
                                   photoUrl,
                                   size = 'lg',
                                   className = '',
                               }: AvatarProps) {
    const sizeClasses = SIZE_CLASSES[size];

    if (photoUrl) {
        return (
            <div
                className={`${sizeClasses} rounded-full overflow-hidden bg-muted border-2 border-border ${className}`}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={photoUrl}
                    alt={fullName}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    const { bg, text } = getColorPair(fullName);
    const initials = getInitials(fullName);

    return (
        <div
            className={`${sizeClasses} rounded-full flex items-center justify-center font-heading font-bold border-2 border-border ${bg} ${text} ${className}`}
            aria-label={fullName}
        >
            {initials}
        </div>
    );
}