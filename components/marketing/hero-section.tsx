"use client";

import type React from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { motion, useMotionValue, useTransform, animate, useSpring } from "framer-motion";

import { Button } from "@/components/ui/button";

// ── Floating orb ─────────────────────────────────────────────────
function Orb({ x, y, size, color, delay }: { x: string; y: string; size: number; color: string; delay: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full blur-2xl"
      style={{ left: x, top: y, width: size, height: size, background: color }}
      animate={{
        y: [0, -30, 0, 20, 0],
        x: [0, 15, -10, 5, 0],
        opacity: [0.15, 0.35, 0.2, 0.3, 0.15],
        scale: [1, 1.08, 0.95, 1.05, 1],
      }}
      transition={{ duration: 8 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

// ── Particle dot ─────────────────────────────────────────────────
function Particle({ x, delay, duration, rise }: { x: number; delay: number; duration: number; rise: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full"
      style={{ left: `${x}%`, bottom: "-10px", width: 3, height: 3, background: "rgba(148,211,193,0.6)" }}
      animate={{ y: [0, -rise], opacity: [0, 0.8, 0] }}
      transition={{ duration, repeat: Infinity, delay, ease: "easeOut" }}
    />
  );
}

// ── Large hero spring plant (decorative) ─────────────────────────
function HeroSpringPlant() {
  return (
    <motion.div
      className="pointer-events-none select-none"
      initial={{ opacity: 0, scale: 0.6, y: 60 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 12, delay: 0.3 }}
    >
      <svg
        width="420"
        height="500"
        viewBox="0 0 420 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible", filter: "drop-shadow(0 0 55px rgba(90,191,150,0.40))" }}
      >
        <defs>
          <linearGradient id="hStemGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5abf96" />
            <stop offset="100%" stopColor="#1a6040" />
          </linearGradient>
          {/* Leaf fill — vibrant mid-green base, bright highlight at tip */}
          <linearGradient id="hLeafLL" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d6b44" />
            <stop offset="45%" stopColor="#2e9e68" />
            <stop offset="100%" stopColor="#5dd494" />
          </linearGradient>
          <linearGradient id="hLeafRL" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#195e3c" />
            <stop offset="45%" stopColor="#28915e" />
            <stop offset="100%" stopColor="#52c88a" />
          </linearGradient>
          <linearGradient id="hCoil" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4aaf90" />
            <stop offset="100%" stopColor="#ffdcc2" stopOpacity="0.7" />
          </linearGradient>
          <radialGradient id="hBud" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#d4f5e6" />
            <stop offset="55%" stopColor="#52c88a" />
            <stop offset="100%" stopColor="#1d7048" />
          </radialGradient>
          <filter id="hGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="9" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="hLeafGlow" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Ground glow */}
        <motion.ellipse
          cx="210" cy="455" rx={95} ry={18}
          fill="rgba(90,191,150,0.18)"
          initial={{ opacity: 0.18 }}
          animate={{ opacity: [0.18, 0.32, 0.18] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Spring coil loops */}
        {[
          "M 115 445 C 100 437 112 425 128 429 C 144 433 142 445 155 445 C 168 445 174 433 185 429 C 196 425 212 434 205 445",
          "M 148 439 C 135 431 146 420 162 424 C 178 428 173 439 183 439 C 193 439 196 428 205 424 C 214 420 225 428 219 439",
          "M 162 432 C 153 426 163 416 175 420 C 187 424 183 432 191 432 C 199 432 201 424 207 420 C 213 416 221 422 216 432",
        ].map((d, i) => (
          <motion.path key={i} d={d}
            stroke="url(#hCoil)" strokeWidth={3.5 - i * 0.6}
            strokeLinecap="round" fill="none" opacity={1 - i * 0.2}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 - i * 0.2 }}
            transition={{ duration: 0.8, delay: 0.1 + i * 0.1, ease: "easeOut" }}
          />
        ))}

        {/* Main stem */}
        <motion.path
          d="M 210 430 C 208 385 206 340 208 295 C 210 250 212 205 210 165 C 208 125 206 92 210 62"
          stroke="url(#hStemGrad)" strokeWidth="5.5" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.2, 0.8, 0.4, 1] }}
        />

        {/* Branches */}
        <motion.path d="M 210 358 C 188 340 155 320 128 300"
          stroke="#38a870" strokeWidth="3.5" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.88 }} />
        <motion.path d="M 210 310 C 232 292 260 272 282 255"
          stroke="#38a870" strokeWidth="3" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.98 }} />
        <motion.path d="M 210 228 C 186 208 152 188 125 168"
          stroke="#2e9e68" strokeWidth="3" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.55, delay: 1.08 }} />
        <motion.path d="M 210 180 C 234 160 265 140 292 122"
          stroke="#2e9e68" strokeWidth="2.5" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.55, delay: 1.13 }} />

        {/* ── LEAF 1: lower-left — broad rounded ── */}
        <motion.path
          d="M 210 368 C 150 352 92 325 78 285 C 95 268 158 325 210 368 Z"
          fill="url(#hLeafLL)" filter="url(#hLeafGlow)"
          initial={{ scale: 0, rotate: 30 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.9 }}
          style={{ transformOrigin: "210px 368px" }}
        />
        {/* Leaf 1 midrib */}
        <motion.path d="M 210 368 C 155 345 100 315 78 285"
          stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 1.05 }} />
        {/* Leaf 1 side veins */}
        <motion.path d="M 162 348 C 155 340 150 334 148 328"
          stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 1.15 }} />
        <motion.path d="M 128 328 C 124 320 122 314 121 308"
          stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 1.2 }} />

        {/* ── LEAF 2: lower-right — broad rounded ── */}
        <motion.path
          d="M 210 318 C 250 300 292 270 312 238 C 295 222 242 292 210 318 Z"
          fill="url(#hLeafRL)" filter="url(#hLeafGlow)"
          initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 14, delay: 1.0 }}
          style={{ transformOrigin: "210px 318px" }}
        />
        {/* Leaf 2 midrib */}
        <motion.path d="M 210 318 C 255 298 294 268 312 238"
          stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 1.15 }} />
        {/* Leaf 2 side veins */}
        <motion.path d="M 255 298 C 260 290 262 283 262 278"
          stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 1.25 }} />
        <motion.path d="M 285 272 C 288 264 290 258 290 253"
          stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 1.3 }} />

        {/* ── LEAF 3: upper-left — broad rounded ── */}
        <motion.path
          d="M 208 238 C 148 218 90 192 75 158 C 92 142 155 212 208 238 Z"
          fill="url(#hLeafLL)" filter="url(#hLeafGlow)"
          initial={{ scale: 0, rotate: 28 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 14, delay: 1.1 }}
          style={{ transformOrigin: "208px 238px" }}
        />
        {/* Leaf 3 midrib */}
        <motion.path d="M 208 238 C 150 215 96 188 75 158"
          stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 1.25 }} />
        {/* Leaf 3 side veins */}
        <motion.path d="M 158 218 C 152 210 148 204 147 198"
          stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 1.35 }} />
        <motion.path d="M 122 198 C 118 190 116 184 115 178"
          stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 1.4 }} />

        {/* ── LEAF 4: upper-right — broad rounded ── */}
        <motion.path
          d="M 212 188 C 252 168 295 140 315 108 C 298 95 248 162 212 188 Z"
          fill="url(#hLeafRL)" filter="url(#hLeafGlow)"
          initial={{ scale: 0, rotate: -28 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 14, delay: 1.2 }}
          style={{ transformOrigin: "212px 188px" }}
        />
        {/* Leaf 4 midrib */}
        <motion.path d="M 212 188 C 255 166 295 138 315 108"
          stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 1.35 }} />
        {/* Leaf 4 side veins */}
        <motion.path d="M 256 168 C 260 160 263 154 263 148"
          stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 1.45 }} />
        <motion.path d="M 288 142 C 292 134 294 128 294 123"
          stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 1.5 }} />

        {/* Top bud */}
        <motion.circle cx="210" cy="54" r="22"
          fill="url(#hBud)" filter="url(#hGlow)"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 10, delay: 1.5 }}
          style={{ transformOrigin: "210px 54px" }}
        />
        <motion.circle cx="204" cy="47" r="9" fill="rgba(255,255,255,0.38)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.35] }}
          transition={{ duration: 1.5, delay: 1.7, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.circle cx="210" cy="54" r="28" fill="none"
          stroke="rgba(90,191,150,0.35)" strokeWidth="1.5"
          animate={{ scale: [1, 1.55], opacity: [0.5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 1.9 }}
          style={{ transformOrigin: "210px 54px" }}
        />

        {/* Floating sparkles */}
        {[
          { cx: 260, cy: 90,  r: 4,   delay: 1.7, color: "#ffdcc2" },
          { cx: 138, cy: 150, r: 3,   delay: 1.9, color: "#90e8c4" },
          { cx: 295, cy: 218, r: 3.5, delay: 2.0, color: "#ffdcc2" },
          { cx: 105, cy: 300, r: 3,   delay: 1.85, color: "#68cca0" },
          { cx: 278, cy: 355, r: 4,   delay: 2.1, color: "#ffdcc2" },
          { cx: 175, cy: 205, r: 2.5, delay: 2.3, color: "#b0e8d2" },
        ].map(({ cx, cy, r, delay: d, color }, i) => (
          <motion.circle key={i} cx={cx} cy={cy} r={r} fill={color}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1, 0.7], opacity: [0, 0.9, 0.35], y: [0, -8, 0] }}
            transition={{ duration: 2.8, delay: d, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </svg>
    </motion.div>
  );
}

// ── Word-by-word animated headline ───────────────────────────────
const HEADLINE_WORDS = ["Redefining", "Destinies", "through", "Digital", "Literacy"];

export function HeroSection() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Parallax layers
  const layerX1 = useTransform(smoothX, [-1, 1], [-12, 12]);
  const layerY1 = useTransform(smoothY, [-1, 1], [-8, 8]);
  const layerX2 = useTransform(smoothX, [-1, 1], [-6, 6]);
  const layerY2 = useTransform(smoothY, [-1, 1], [-4, 4]);
  const plantX  = useTransform(smoothX, [-1, 1], [8, -8]);
  const plantY  = useTransform(smoothY, [-1, 1], [5, -5]);

  function onMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mouseX.set((e.clientX - rect.left - rect.width / 2) / (rect.width / 2));
    mouseY.set((e.clientY - rect.top - rect.height / 2) / (rect.height / 2));
  }

  function onMouseLeave() {
    animate(mouseX, 0, { type: "spring", stiffness: 100, damping: 30 });
    animate(mouseY, 0, { type: "spring", stiffness: 100, damping: 30 });
  }

  // Deterministic values — no Math.random() to avoid SSR hydration mismatch
  const particles = Array.from({ length: 18 }, (_, i) => ({
    x: 5 + (i / 17) * 90,
    delay: (i * 0.7) % 4,
    duration: 4 + (i % 3),
    rise: 420 + ((i * 73) % 260), // deterministic "random" rise distance
  }));

  return (
    <section
      id="mission"
      className="relative -mt-16 flex min-h-screen flex-col overflow-hidden pt-16"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Base dark background */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(148deg, #000806 0%, #000f0b 25%, #001510 55%, #001a14 80%, #001e17 100%)" }}
      />

      {/* Animated grid lines — 3D perspective */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148,211,193,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,211,193,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          transform: "perspective(600px) rotateX(18deg)",
          transformOrigin: "50% 100%",
          maskImage: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)",
        }}
      />

      {/* Fine dot grid on top */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Animated colour orbs — layer 1 (slow) */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ x: layerX1, y: layerY1 }}>
        <Orb x="-5%" y="10%" size={420} color="radial-gradient(circle, rgba(148,211,193,0.18) 0%, transparent 70%)" delay={0} />
        <Orb x="70%" y="-8%" size={380} color="radial-gradient(circle, rgba(255,204,170,0.15) 0%, transparent 70%)" delay={1.5} />
        <Orb x="40%" y="65%" size={280} color="radial-gradient(circle, rgba(148,211,193,0.12) 0%, transparent 70%)" delay={2.5} />
      </motion.div>

      {/* Orbs layer 2 (faster) */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ x: layerX2, y: layerY2 }}>
        <Orb x="85%" y="45%" size={260} color="radial-gradient(circle, rgba(255,204,170,0.1) 0%, transparent 70%)" delay={0.8} />
        <Orb x="15%" y="75%" size={200} color="radial-gradient(circle, rgba(74,175,148,0.12) 0%, transparent 70%)" delay={3} />
      </motion.div>

      {/* Rising particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <Particle key={i} x={p.x} delay={p.delay} duration={p.duration} rise={p.rise} />
        ))}
      </div>

      {/* Grain texture */}
      <div className="pointer-events-none absolute inset-0 scholar-hero-grain" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]" />

      {/* Main content */}
      <div className="relative flex flex-1 flex-col justify-center px-4 pb-24 pt-8 sm:px-6 lg:pb-32">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_460px]">

            {/* ── Left: text content ────────────────────────── */}
            <div className="flex flex-col items-start">

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-7 flex items-center gap-2.5 rounded-full border border-[#94d3c1]/30 bg-[#94d3c1]/12 px-4 py-2 backdrop-blur-sm"
              >
                {/* Animated spring logo mark */}
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
                    <path d="M 3 20 C 1 18 4 16 6 17 C 8 18 8 20 9 20 C 10 20 10 18 12 17 C 14 16 17 18 15 20" stroke="#94d3c1" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
                    <line x1="9" y1="18" x2="9" y2="4" stroke="#94d3c1" strokeWidth="1.6" strokeLinecap="round"/>
                    <path d="M 9 13 C 6 11 2 10 1 7 C 5 9 8 11 9 13 Z" fill="#94d3c1" opacity="0.8"/>
                    <path d="M 9 9 C 12 7 15 5 16 2 C 13 4 10 7 9 9 Z" fill="#94d3c1" opacity="0.9"/>
                    <circle cx="9" cy="3" r="2.5" fill="#94d3c1"/>
                  </svg>
                </motion.div>
                <span className="text-xs font-semibold tracking-wide text-[#5dd494]">
                  Project Spring Up &mdash; Roman Ridge, Accra
                </span>
              </motion.div>

              {/* Headline — word-by-word reveal */}
              <h1 className="max-w-2xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-[70px]">
                {HEADLINE_WORDS.map((word, i) => (
                  <motion.span
                    key={word}
                    className="mr-3 inline-block"
                    initial={{ opacity: 0, y: 40, rotateX: -30 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 120,
                      damping: 14,
                      delay: 0.25 + i * 0.1,
                    }}
                    style={{ perspective: 600 }}
                  >
                    {(word === "Digital" || word === "Literacy") ? (
                      <span className="text-[#5dd494] font-bold">
                        {word}
                      </span>
                    ) : (
                      <span className="text-white">{word}</span>
                    )}
                  </motion.span>
                ))}
              </h1>

              {/* Sub */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.75 }}
                className="mt-7 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl"
              >
                Empowering Ghana&apos;s young men at the{" "}
                    <span className="font-semibold text-[#5dd494]">Senior Correctional Centre</span>{" "}
                with digital skills and ethical leadership — turning a correctional stay into a
                career launchpad.
              </motion.p>

              {/* CTA row */}
              <motion.div
                className="mt-10 flex flex-col gap-3 sm:flex-row"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    className="w-full gap-2 text-base font-semibold shadow-lg transition-all sm:w-auto hover:scale-[1.03] active:scale-[0.98]"
                    style={{
                      background: "linear-gradient(135deg, #c8f542 0%, #a8e832 100%)",
                      color: "#0a2a10",
                      boxShadow: "0 4px 24px rgba(180,235,50,0.35)",
                    }}
                    asChild
                  >
                    <Link href="/login">
                      Enter Learning Portal
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-white/25 bg-white/8 text-base text-white/90 backdrop-blur-sm hover:bg-white/14 hover:text-white sm:w-auto"
                    asChild
                  >
                    <a href="#curriculum">Explore Curriculum</a>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Mini stat strip */}
              <motion.div
                className="mt-12 flex flex-wrap gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.1 }}
              >
                {[
                  { value: "120+", label: "Students" },
                  { value: "92%",  label: "Completion" },
                  { value: "4",    label: "Pillars" },
                  { value: "1,200+", label: "Hours Delivered" },
                ].map(({ value, label }) => (
                  <div key={label} className="flex flex-col">
                    <span className="font-display text-2xl font-bold text-[#5dd494] tabular-nums">{value}</span>
                    <span className="text-xs font-medium text-white/65 uppercase tracking-wider">{label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ── Right: spring plant illustration ─────────── */}
            <motion.div
              className="hidden lg:flex items-center justify-center"
              style={{ x: plantX, y: plantY }}
            >
              <div className="relative">
                {/* Glow disc behind plant */}
                <motion.div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ width: 300, height: 300 }}
                  animate={{ opacity: [0.08, 0.18, 0.08], scale: [1, 1.08, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="h-full w-full rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(148,211,193,0.5) 0%, transparent 70%)" }} />
                </motion.div>

                <HeroSpringPlant />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.6 }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4 text-white/45" />
        </motion.div>
      </motion.div>
    </section>
  );
}
