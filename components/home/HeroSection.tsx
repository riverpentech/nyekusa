'use client'

import React, { useState, useEffect, useCallback } from "react";
import  Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
    {
        url: "/home/1.webp",
        caption: "Building futures together at DeKUT",
    },
    {
        url: "/home/2.webp",
        caption: "A community rooted in Nyeri heritage",
    },
    {
        url: "/home/3.webp",
        caption: "Students leading with purpose",
    },
    {
        url: "/home/4.webp",
        caption: "Innovation and excellence at every step",
    },
    {
        url: "/home/5.webp",
        caption: "Connecting students across years and disciplines",
    },
];

export default function HeroSection() {
    const [current, setCurrent] = useState(0);
    const [transitioning, setTransitioning] = useState(false);

    const goTo = useCallback((index: number) => {
        if (transitioning) return;
        setTransitioning(true);
        setTimeout(() => {
            setCurrent(index);
            setTransitioning(false);
        }, 300);
    }, [transitioning]);

    const next = useCallback(() => {
        goTo((current + 1) % slides.length);
    }, [current, goTo]);

    const prev = useCallback(() => {
        goTo((current - 1 + slides.length) % slides.length);
    }, [current, goTo]);

    useEffect(() => {
        const timer = setInterval(next, 5500);
        return () => clearInterval(timer);
    }, [next]);

    return (
        <section className="relative w-full h-screen min-h-150 max-h-150 overflow-hidden">
            {slides.map((slide, i) => (
                <div
                    key={i}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        i === current ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                >
                    <img
                        src={slide.url}
                        alt={slide.caption}
                        className="w-full h-full object-cover"
                        loading={i === 0 ? "eager" : "lazy"}
                    />
                </div>
            ))}

            <div className="absolute inset-0 z-20 bg-linear-to-t from-black/80 via-black/40 to-black/20" />
            <div className="absolute inset-0 z-20 bg-linear-to-r from-black/30 via-transparent to-transparent" />

            <div className="relative z-30 h-full flex flex-col justify-end pb-16 sm:pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-2xl">

                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                                <img
                                    src="/nyekusa.svg"
                                    width="auto"
                                    height="auto"
                                    alt="NYEKUSA"
                                    className="w-full h-full object-contain drop-shadow-lg"
                                />
                            </div>
                            <div>
                                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-none">
                                    NYEKUSA
                                </h1>
                                <p className="font-heading text-base sm:text-lg text-secondary italic mt-1 font-normal tracking-wide">
                                    our unity, our strength
                                </p>
                            </div>
                        </div>

                        <p className="text-white/85 text-lg sm:text-xl leading-relaxed mb-8 max-w-xl font-body font-light">
                            Uniting <span className="text-secondary font-medium">100+ students</span> from Nyeri County at DeKUT — building community, fostering leadership, and creating lasting connections.
                        </p>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <Link href="/join">
                                <Button
                                    size="lg"
                                    className="bg-secondary hover:bg-secondary/90 hover:scale-105 text-secondary-foreground font-semibold px-8 h-12 text-base shadow-lg"
                                >
                                    Become a Member <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                            <Link href="/events">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:scale-105 backdrop-blur-sm font-medium px-8 h-12 text-base"
                                >
                                    Explore Events
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 text-center">
                <p className="text-white/40 text-xs italic font-body hidden sm:block">
                    {slides[current].caption}
                </p>
            </div>

            <div className="absolute bottom-5 right-6 sm:right-8 z-30 flex items-center gap-2">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`transition-all duration-300 rounded-full ${
                            i === current
                                ? "w-6 h-2 bg-secondary"
                                : "w-2 h-2 bg-white/40 hover:bg-white/70"
                        }`}
                    />
                ))}
            </div>

            <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm flex items-center justify-center text-white transition-all border border-white/10 hover:border-white/30"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm flex items-center justify-center text-white transition-all border border-white/10 hover:border-white/30"
            >
                <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-0 left-0 right-0 z-30 flex h-1">
                <div className="flex-1 bg-primary" />
                <div className="flex-1 bg-secondary" />
                <div className="flex-1 bg-destructive" />
            </div>
        </section>
    );
}