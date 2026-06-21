import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {ArrowRight, Target, Heart, Award, Camera} from "lucide-react";

const values = [
    {
        icon: Target,
        title: "Leadership",
        desc: "Developing tomorrow's leaders through mentorship and community governance.",
        color: "text-primary bg-accent",
    },
    {
        icon: Heart,
        title: "Community",
        desc: "Building bonds among Nyeri students that last well beyond university.",
        color: "text-secondary-foreground bg-secondary/20",
    },
    {
        icon: Award,
        title: "Excellence",
        desc: "Pursuing the highest standards in academics, character, and innovation.",
        color: "text-destructive bg-destructive/10",
    },
    {
        icon: Camera,
        title: "Memories",
        desc: "Creating lasting connections and memories for generations to come.",
        color: "text-muted-foreground bg-muted",
    }
];

export default function AboutPreview() {
    return (
        <section className="py-20 sm:py-28 bg-card border-y border-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    <div>
                        <div className="inline-flex items-center gap-2 mb-6">
                            <span className="w-2 h-2 border-l-2 border-t-2 border-secondary" />
                            <span className="text-xs font-semibold tracking-widest uppercase text-primary font-body">About NYEKUSA</span>
                            <span className="w-2 h-2 border-r-2 border-b-2 border-secondary" />
                        </div>
                        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-5 leading-tight">
                            A Home Away From Home
                        </h2>
                        <p className="text-muted-foreground text-base leading-relaxed mb-4 max-w-lg">
                            NYEKUSA was founded to unite students from Nyeri County studying at Dedan Kimathi University of Technology. We create an inclusive community where students can thrive, learn and grow together.
                        </p>
                        <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-lg">
                            Rooted in the spirit of <span className="text-foreground font-medium">Mt. Kenya</span> — our symbol of heritage and strength — we celebrate Nyeri&apos;s rich culture while preparing ourselves for the world beyond campus.
                        </p>
                        <Link href="/about">
                            <Button variant="outline" className="font-medium border-border hover:border-primary/30 hover:bg-accent">
                                Learn Our Story <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {values.map((item) => (
                            <div
                                key={item.title}
                                className="flex gap-4 p-5 rounded-xl border border-border/50 bg-background hover:border-primary/20 hover:shadow-sm transition-all"
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-body font-semibold text-foreground mb-1">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}

                        <div className="relative rounded-xl overflow-hidden h-36">
                            <img
                                src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&h=300&fit=crop&q=80"
                                alt="Mt Kenya"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-linear-to-r from-primary/60 to-transparent flex items-center px-5">
                                <div>
                                    <p className="text-white text-xs font-semibold tracking-widest uppercase mb-1">Our Roots</p>
                                    <p className="text-white/90 font-heading font-semibold text-lg leading-tight">Mt. Kenya, Nyeri County</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
