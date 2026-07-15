"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRegister = pathname.includes("/join");

  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkSize = () => setIsLargeScreen(window.innerWidth >= 1024);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  return (
    <div className="min-h-screen relative flex flex-col lg:flex-row lg:overflow-hidden overflow-y-auto bg-background">
      {/* Animated Layout Wrapper */}
      <div className="flex-1 relative flex flex-col lg:flex-row w-full min-h-screen">
        
        {/* Side Image Section */}
        <motion.div 
          className="hidden lg:block relative h-full w-1/2 z-10"
          initial={false}
          animate={isLargeScreen ? { 
            x: isRegister ? "100%" : "0%",
          } : {}}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        >
          <Image
            src="/school-gate.webp"
            alt="School Gate"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px]" />
          
          {/* Decorative Overlay on Image */}
          <div className="absolute inset-0 flex items-center justify-center p-12 text-white pointer-events-none overflow-hidden">
            <AnimatePresence mode="wait">
               <motion.div
                key={isRegister ? "reg-content" : "login-content"}
                initial={{ opacity: 0, x: isRegister ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRegister ? -50 : 50 }}
                transition={{ duration: 0.4 }}
                className="text-center space-y-4"
               >
                  <h1 className="text-5xl font-black tracking-tighter uppercase drop-shadow-lg">
                    {isRegister ? "Join the Tribe" : "Welcome Back"}
                  </h1>
                  <p className="text-lg font-medium opacity-90 drop-shadow-md">
                    {isRegister ? "Start your journey with Nyekusa" : "Sign in to continue your experience"}
                  </p>
               </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div 
          className="relative flex-1 flex items-center justify-center p-4 sm:p-6 py-12 sm:py-16 lg:py-6 bg-background z-20"
          initial={false}
          animate={isLargeScreen ? { 
            x: isRegister ? "-100%" : "0%",
          } : {}}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        >
          {/* Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
            <Image
              src="/nyekusa.svg"
              alt="Nyekusa Logo"
              width={600}
              height={600}
              priority
              className="w-full max-w-[80%] h-auto rotate-12 scale-110"
            />
          </div>

          {/* Card Container */}
          <div className="relative z-10 w-full max-w-lg">
            {children}
          </div>
        </motion.div>

        <motion.div 
          className="hidden lg:block absolute top-0 bottom-0 w-full pointer-events-none z-30"
          initial={false}
          animate={isLargeScreen ? { 
            left: "50%",
            x: "-50%",
          } : {}}
          transition={{ type: "spring", stiffness: 40, damping: 12 }}
        >
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-secondary border-4 border-background flex items-center justify-center shadow-lg"
              animate={{
                rotate: isRegister ? 360 : 0
              }}
              transition={{ type: "spring", stiffness: 40, damping: 12 }}
            >
                <div className="w-2 h-2 rounded-full bg-background animate-pulse" />
            </motion.div>
        </motion.div>
      </div>
    </div>
  );
}