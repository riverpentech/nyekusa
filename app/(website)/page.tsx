import React from "react";
import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import EventsPreview from "@/components/home/EventsPreview";
import LeadershipPreview from "@/components/home/LeadershipPreview";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";
import AboutPreview from "@/components/home/AboutPreview";

export default function Home() {
    return (
        <div>
            <HeroSection />
            <StatsSection />
            <AboutPreview />
            <EventsPreview />
            <LeadershipPreview />
            <TestimonialsSection />
            <CTASection />
        </div>
    );
}