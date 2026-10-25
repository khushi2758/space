"use client";
import ChatbotIcon from "./Chaticon";

import React from "react";
import Image from "next/image";
import { Orbitron } from "next/font/google";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import Navbar from "./navbar";

import earthi from "../../public/images/earthi.png";
import asteroHome from "../../public/images/asteroHome.png";

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
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const astroX = useSpring(mouseX, { damping: 30, stiffness: 200 });
  const astroY = useSpring(mouseY, { damping: 30, stiffness: 200 });
  const earthX = useSpring(useMotionValue(0), { damping: 40, stiffness: 100 });
  const earthY = useSpring(useMotionValue(0), { damping: 40, stiffness: 100 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 90;
    const y = (e.clientY / window.innerHeight - 0.5) * 90;
    mouseX.set(x);
    mouseY.set(y);
    earthX.set(x * 0.3);
    earthY.set(y * 0.3);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen  bg-[#02020a] overflow-hidden"
    >
      <Navbar />

      <motion.div style={{ x: earthX, y: earthY }} className="absolute inset-0 z-10">
        <Image
          src={earthi}
          alt="Earth"
          className="opacity-40 w-[90%] mx-auto mt-24 h-[60%]"
          priority
        />
      </motion.div>

      <motion.div style={{ x: astroX, y: astroY }} className="absolute inset-0 z-20">
        <Image
          src={asteroHome}
          alt="Astronaut"
          width={400}
          height={400}
          className="mx-auto mt-60"
          priority
        />
      </motion.div>

      <main className="relative z-30 px-16 pt-40 max-w-3xl text-white">
 
        <div className="mb-4 text-cyan-400 text-xs font-mono uppercase tracking-widest">
          System status nominal
        </div>
     
        <h1 className={`${orbitron.className} text-5xl uppercase tracking-widest font-bold mb-8`}>
          Operator <br />
          <span className="text-cyan-400">Session Restored</span>
        </h1>

        <div className="space-y-4 font-mono text-gray-300">
          {systemLines.map((line, i) => (
            <p key={i} className="border-l border-white/10 pl-4">
              [{i + 1}] {line}
            </p>
          ))}
        </div>
        <Link href="/AestDest" className="mt-8 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-mono rounded-md transition-colors duration-200 inline-block">
          Access Dashboard
          </Link>
      <ChatbotIcon />

      </main>
    </div>
  );
}