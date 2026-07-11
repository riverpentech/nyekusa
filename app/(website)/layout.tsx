import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { Toaster } from "sonner";
import Providers from "@/app/providers";
import {SessionProvider} from "next-auth/react";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NYEKUSA | Nyeri Kimathi University Student Association",
  description: "Our Unity, Our Strength. NYEKUSA is the home for students from Nyeri County studying at Dedan Kimathi University of Technology.",
  applicationName: "NYEKUSA",
  appleWebApp: {
    title: "NYEKUSA",
  }
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
          lang="en"
          className={`${montserrat.variable} ${poppins.variable} h-full antialiased`}
      >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
      <Providers>
      <Toaster position="top-center" richColors closeButton />
      <Navbar />
      {children}
      <Footer/>
      </Providers>
      </body>
      </html>
  );
}