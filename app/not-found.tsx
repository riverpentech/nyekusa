"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Compass, Home, Mail } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background px-4">

            {/* Logo watermark */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
            >
                <Image
                    src="/nyekusa.svg"
                    alt=""
                    width={900}
                    height={900}
                    priority
                    className="w-[85vw] max-w-[820px] h-auto opacity-[0.045] grayscale"
                />
            </div>

            {/* Ambient decoration, consistent with the rest of the product */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden"
            >
                <div
                    className="absolute -top-40 -left-40 w-130 h-130 rounded-full opacity-[0.07]"
                    style={{ background: "hsl(122 46% 23%)" }}
                />
                <div
                    className="absolute -bottom-32 -right-32 w-120 h-120 rounded-full border-56 opacity-[0.06]"
                    style={{ borderColor: "hsl(43 78% 46%)" }}
                />
                <svg
                    className="absolute inset-0 w-full h-full opacity-[0.035]"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <pattern
                            id="dots"
                            x="0"
                            y="0"
                            width="28"
                            height="28"
                            patternUnits="userSpaceOnUse"
                        >
                            <circle cx="2" cy="2" r="1.5" fill="hsl(122 46% 23%)" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dots)" />
                </svg>
            </div>

            <button
                onClick={() => router.back()}
                className="absolute top-6 left-6 z-10 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
            >
                <ArrowLeft
                    size={16}
                    className="transition-transform group-hover:-translate-x-0.5"
                />
                Go back
            </button>

            <div className="relative z-10 mb-10">
                <Image
                    src="/nyekusa.svg"
                    alt="NYEKUSA"
                    width={148}
                    height={40}
                    priority
                    className="h-10 w-auto"
                />
            </div>

            <div className="relative z-10 w-full max-w-lg">

                <div
                    className="h-1 w-16 rounded-full mb-8 mx-auto"
                    style={{ background: "hsl(43 78% 46%)" }}
                />

                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center"
                            style={{
                                background:
                                    "radial-gradient(circle at 35% 35%, hsl(122 40% 28%), hsl(122 46% 18%))",
                                boxShadow: "0 8px 32px hsl(122 46% 23% / 0.25)",
                            }}
                        >
                            <div
                                className="w-17 h-17 rounded-full flex items-center justify-center border-2"
                                style={{ borderColor: "hsl(43 78% 46% / 0.5)" }}
                            >
                                <Compass size={28} strokeWidth={1.4} className="text-white" />
                            </div>
                        </div>

                        <span
                            className="absolute inset-0 rounded-full animate-ping opacity-10"
                            style={{ background: "hsl(122 46% 23%)" }}
                        />
                    </div>
                </div>

                <p
                    className="font-heading text-center font-bold tracking-tight mb-1"
                    style={{ fontSize: "4.5rem", lineHeight: 1, color: "hsl(122 46% 20%)" }}
                >
                    404
                </p>

                <h1 className="font-heading text-2xl font-bold text-center text-foreground tracking-tight mb-3">
                    Page Not Found
                </h1>

                <p className="font-body text-base text-muted-foreground text-center leading-relaxed mb-8 px-2">
                    The page you&apos;re looking for doesn&apos;t exist or may have been moved.
                    Check the address, or head back to where you came from.
                </p>

                <div className="flex items-center gap-4 mb-8">
                    <div className="flex-1 h-px" style={{ background: "hsl(48 14% 87%)" }} />
                    <span className="text-xs font-semibold text-gold uppercase tracking-widest whitespace-nowrap">
                        Error Code 404
                    </span>
                    <div className="flex-1 h-px" style={{ background: "hsl(48 14% 87%)" }} />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/" className="w-full sm:w-auto">
                        <button
                            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md border text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            style={{ borderColor: "hsl(48 14% 87%)" }}
                        >
                            <Home size={15} />
                            Return to Homepage
                        </button>
                    </Link>
                    <Link href="/contact" className="w-full sm:w-auto">
                        <button
                            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-opacity hover:opacity-90"
                            style={{
                                background:
                                    "linear-gradient(135deg, hsl(122 46% 23%), hsl(122 40% 30%))",
                                color: "hsl(48 25% 97%)",
                            }}
                        >
                            <Mail size={15} />
                            Contact Us
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}