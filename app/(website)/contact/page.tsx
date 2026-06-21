'use client'

import React, { useState } from "react";
import PageHero from "@/components/shared/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send, CheckCircle, MessageSquare, Camera, Briefcase, X } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

interface FormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export default function Contact() {
    const [form, setForm] = useState<FormData>({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name || !form.email || !form.message) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setSubmitting(true);

        try {
            // Replace with your actual API endpoint
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            setSubmitted(true);
            setForm({ name: "", email: "", subject: "", message: "" });
            toast.success("Message sent successfully!");
        } catch (error) {
            console.error('Contact form error:', error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <Toaster />
            <PageHero
                badge="Get in Touch"
                title="Contact Us"
                description="Have a question, idea, or want to join NYEKUSA? We'd love to hear from you."
            />

            <section className="py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-5 gap-16">
                        {/* Contact Info */}
                        <div className="lg:col-span-2">
                            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Reach Out</h2>
                            <p className="text-muted-foreground leading-relaxed mb-8">
                                Whether you&apos;re a prospective member, current student, or alumni — we&apos;re here to connect with you.
                            </p>

                            <div className="space-y-5">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                                        <Mail className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-body font-medium text-foreground text-sm">Email</p>
                                        <a href="mailto:nyekusa01@gmail.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                            nyekusa01@gmail.com
                                        </a>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                                        <Phone className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-body font-medium text-foreground text-sm">Phone</p>
                                        <a href="tel:+254768397693" className="text-sm text-muted-foreground">+254 768 397 693</a>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-body font-medium text-foreground text-sm">Location</p>
                                        <p className="text-sm text-muted-foreground">Dedan Kimathi University of Technology<br/>Nyeri, Kenya</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10">
                                <p className="font-body font-medium text-foreground text-sm mb-3">Follow Us</p>
                                <div className="flex items-center gap-3">
                                    {[
                                        { platform: "Facebook", icon: MessageSquare, href: "https://facebook.com/nyekusa" },
                                        { platform: "Instagram", icon: Camera, href: "https://instagram.com/nyekusa" },
                                        { platform: "Twitter", icon: X, href: "https://twitter.com/nyekusa" },
                                        { platform: "LinkedIn", icon: Briefcase, href: "https://linkedin.com/company/nyekusa" }
                                    ].map(({ platform, icon: Icon, href }) => (
                                        <a
                                            key={platform}
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
                                            title={platform}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-3">
                            {submitted ? (
                                <div className="bg-card rounded-xl border border-border/50 p-10 text-center">
                                    <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                                    <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Message Sent!</h3>
                                    <p className="text-muted-foreground mb-6">Thank you for reaching out. We&apos;ll get back to you soon.</p>
                                    <Button variant="outline" onClick={() => setSubmitted(false)}>Send Another Message</Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border/50 p-6 sm:p-8 space-y-5">
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div>
                                            <Label htmlFor="name" className="text-sm font-medium mb-1.5 block">Name *</Label>
                                            <Input
                                                id="name"
                                                placeholder="Your full name"
                                                value={form.name}
                                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email" className="text-sm font-medium mb-1.5 block">Email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="your.email@example.com"
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="subject" className="text-sm font-medium mb-1.5 block">Subject</Label>
                                        <Input
                                            id="subject"
                                            placeholder="What's this about?"
                                            value={form.subject}
                                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="message" className="text-sm font-medium mb-1.5 block">Message *</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Tell us more..."
                                            rows={5}
                                            value={form.message}
                                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-11"
                                    >
                                        {submitting ? "Sending..." : <>Send Message <Send className="w-4 h-4 ml-2" /></>}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
