import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { Toaster } from "sonner";
import Providers from "@/app/providers";

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
      <Providers>
        <Toaster position="top-center" richColors closeButton />
        <Navbar />
        {children}
        <Footer/>
      </Providers>
  );
}