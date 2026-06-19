"use client"

import React from "react";
import PageHero from "@/components/shared/PageHero";
import { BookOpen, Eye, Target, Heart, Users, Award, Lightbulb, Shield } from "lucide-react";

const values = [
    { icon: Heart, title: "Unity", desc: "Fostering togetherness among students from Nyeri County." },
    { icon: Users, title: "Community", desc: "Building a supportive network that extends beyond campus." },
    { icon: Award, title: "Excellence", desc: "Pursuing the highest standards in academics and character." },
    { icon: Target, title: "Leadership", desc: "Empowering students to lead with integrity and vision." },
    { icon: Lightbulb, title: "Innovation", desc: "Encouraging creative solutions to community challenges." },
    { icon: Shield, title: "Heritage", desc: "Celebrating the rich culture and traditions of Nyeri." },
];

const timeline = [
    { year: "2019", title: "Foundation", desc: "NYEKUSA was established by a group of pioneering students from Nyeri County at DeKUT." },
    { year: "2020", title: "First Major Event", desc: "Hosted the inaugural Cultural Day, bringing together over 200 students." },
    { year: "2021", title: "Alumni Network", desc: "Launched the alumni mentorship program connecting graduates with current students." },
    { year: "2022", title: "Digital Expansion", desc: "Adapted to virtual community building during the pandemic, keeping the spirit alive." },
    { year: "2023", title: "500+ Members", desc: "Reached a milestone of 500 active members, solidifying our presence at DeKUT." },
    { year: "2024", title: "Digital Platform", desc: "Launched the NYEKUSA digital platform to connect members and alumni seamlessly." },
];

export default function About() {
    return (
        <div>
            <PageHero
                badge="Our Story"
                title="About NYEKUSA"
                description="Many years of building community, fostering leadership, and creating lasting bonds among Nyeri County students at DeKUT."
            />

            <section className="py-20 sm:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                                    <Eye className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="font-heading text-2xl font-bold text-foreground">Our Vision</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                Our vision is to create a strong Nation wide community of Nyeri students who are well-equipped with the knowledge,
                                skills, and attitudes needed to be successful leaders in their academic and professional endeavors.
                                We aim to be the leading student organization in Kimathi University. Promoting academic excellence, cultural
                                diversity, and community service in the University and beyond.
                            </p>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="font-heading text-2xl font-bold text-foreground">Our Mission</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                Our mission is to promote academic excellence, social and cultural development and community service among Nyeri
                                students in Dedan Kimathi University and beyond.
                                We aim to create a platform for students to develop leadership skills, cultural awareness and community engagement
                                through various programs and initiatives.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 sm:py-28 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary bg-accent px-3 py-1 rounded-full mb-4">Values</span>
                        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight">What We Stand For</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {values.map((v) => (
                            <div key={v.title} className="bg-card rounded-xl border border-border/50 p-6 hover:border-primary/20 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                                    <v.icon className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="font-body font-semibold text-foreground mb-1.5">{v.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 sm:py-28">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary bg-accent px-3 py-1 rounded-full mb-4">Legacy</span>
                        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Our Journey</h2>
                    </div>
                    <div className="space-y-0">
                        {timeline.map((item, i) => (
                            <div key={item.year} className="flex gap-6">
                                <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 rounded-full bg-primary shrink-0 mt-1.5" />
                                    {i < timeline.length - 1 && <div className="w-px flex-1 bg-border" />}
                                </div>
                                <div className="pb-10">
                                    <span className="text-xs font-semibold text-primary">{item.year}</span>
                                    <h3 className="font-body font-semibold text-foreground mt-1">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}