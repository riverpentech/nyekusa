import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Users, Calendar } from "lucide-react";

export default function CTASection() {
    const infoCards = [
        {
            icon: <MapPin className="w-5 h-5" />,
            title: "Location",
            description: "Dedan Kimathi University of Technology, Nyeri, Kenya",
        },
        {
            icon: <Users className="w-5 h-5" />,
            title: "Who Can Join?",
            description:
                "Any DeKUT student from Nyeri County or anywhere else. All are welcome.",
        },
        {
            icon: <Calendar className="w-5 h-5" />,
            title: "Meetings",
            description:
                "Every Thursday at SOB room 5 during semester. Check our gallery for what you're missing!",
        },
    ];

    return (
        <section className="py-20 sm:py-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <p className="text-sm font-semibold tracking-widest uppercase text-secondary mb-3">
                        Get in Touch
                    </p>
                    <h2 className="font-heading text-4xl sm:text-5xl font-bold text-primary tracking-tight mb-4">
                        Join Our Community
                    </h2>
                    <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                        Interested in NYEKUSA? Reach out and become part of our growing
                        family of 100+ students from Nyeri County.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
                    {infoCards.map((card) => (
                        <div
                            key={card.title}
                            className="rounded-2xl bg-card border border-border px-8 py-8 text-center shadow-sm"
                        >
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-4">
                                {card.icon}
                            </div>
                            <h3 className="font-heading font-semibold text-primary mb-2">
                                {card.title}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {card.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="relative rounded-2xl bg-primary overflow-hidden px-8 py-16 sm:px-16 sm:py-20">
                    <div
                        className="absolute inset-0 opacity-[0.07]"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                            backgroundSize: "28px 28px",
                        }}
                    />
                    <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-secondary/20 blur-3xl" />
                    <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-destructive/10 blur-3xl" />

                    <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10">
                        <div className="text-center lg:text-left max-w-xl">
                            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-primary-foreground tracking-tight mb-3">
                                Ready to Join Our Community?
                            </h2>
                            <p className="text-primary-foreground/65 text-base sm:text-lg leading-relaxed">
                                Connect with 100+ students from Nyeri County. Build lasting
                                friendships, develop leadership skills, and access exclusive
                                opportunities.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-3 shrink-0">
                            <Link href="/join">
                                <Button
                                    size="lg"
                                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-8 h-12 shadow-lg"
                                >
                                    Become a Member{" "}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                            <Link href="/about">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 font-medium px-8 h-12"
                                >
                                    Our Story
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}