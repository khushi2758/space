"use client";

import ChatbotIcon from "./Chaticon";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Orbitron } from "next/font/google";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "./navbar";

import earthi from "../../public/images/earthi.png";
import asteroHome from "../../public/images/asteroHome.png";
import { getCurrentUser } from "@/features/auth/auth.api";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const systemLines = [
  "Orbital data stream synchronized.",
  "Near Earth object registry updated.",
  "New trajectories detected in monitored radius.",
];

export default function Homepage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // Verify the logged-in user with the backend
  useEffect(() => {
    let active = true;

    const verifyUser = async () => {
      try {
        const response = await getCurrentUser();

        const user =
          response?.user ??
          response?.data?.user ??
          response?.data ??
          response;

        if (!user || typeof user !== "object" ||
            !(user._id || user.id || user.userId || user.email)) {
          router.replace("/Loginpage");
          return;
        }

        if (active) {
          setAuthenticated(true);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        router.replace("/Loginpage");
      } finally {
        if (active) {
          setCheckingAuth(false);
        }
      }
    };

    verifyUser();

    return () => {
      active = false;
    };
  }, [router]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const astroX = useSpring(mouseX, { damping: 30, stiffness: 200 });
  const astroY = useSpring(mouseY, { damping: 30, stiffness: 200 });

  const earthX = useSpring(useMotionValue(0), {
    damping: 40,
    stiffness: 100,
  });
  const earthY = useSpring(useMotionValue(0), {
    damping: 40,
    stiffness: 100,
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 90;
    const y = (e.clientY / window.innerHeight - 0.5) * 90;

    mouseX.set(x);
    mouseY.set(y);
    earthX.set(x * 0.3);
    earthY.set(y * 0.3);
  };

  // Avoid rendering protected content before authentication is checked
  if (checkingAuth || !authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#02020a] text-cyan-300">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />
          <p className={`${orbitron.className} text-sm tracking-widest`}>
            VERIFYING OPERATOR...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-hidden bg-[#02020a]"
    >
      <Navbar />

      <motion.div
        style={{ x: earthX, y: earthY }}
        className="absolute inset-0 z-10"
      >
        <Image
          src={earthi}
          alt="Earth"
          className="mx-auto mt-24 h-[60%] w-[90%] opacity-40"
          priority
        />
      </motion.div>

      <motion.div
        style={{ x: astroX, y: astroY }}
        className="absolute inset-0 z-20"
      >
        <Image
          src={asteroHome}
          alt="Astronaut"
          width={400}
          height={400}
          className="mx-auto mt-60"
          priority
        />
      </motion.div>

      <main className="relative z-30 max-w-3xl px-6 pt-40 text-white sm:px-16">
        <div className="mb-4 font-mono text-xs uppercase tracking-widest text-cyan-400">
          System status nominal
        </div>

        <h1
          className={`${orbitron.className} mb-8 text-4xl font-bold uppercase tracking-widest sm:text-5xl`}
        >
          Operator
          <br />
          <span className="text-cyan-400">Session Restored</span>
        </h1>

        <div className="space-y-4 font-mono text-gray-300">
          {systemLines.map((line, i) => (
            <p key={i} className="border-l border-white/10 pl-4">
              [{i + 1}] {line}
            </p>
          ))}
        </div>

        <Link
          href="/AestDest"
          className="mt-8 inline-block rounded-md bg-cyan-500 px-6 py-3 font-mono text-white transition-colors duration-200 hover:bg-cyan-600"
        >
          Access Dashboard
        </Link>

        <ChatbotIcon />
      </main>
    </div>
  );
}
