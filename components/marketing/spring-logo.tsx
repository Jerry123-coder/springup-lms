"use client";

import { motion } from "framer-motion";

interface SpringLogoProps {
  size?: number;
  className?: string;
  variant?: "mark" | "full";
  animated?: boolean;
}

export function SpringLogo({
  size = 48,
  className = "",
  variant = "mark",
  animated = true,
}: SpringLogoProps) {
  const sp = (stiffness: number, damping: number, delay: number) =>
    ({ type: "spring" as const, stiffness, damping, delay });

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div style={{ width: size, height: size, position: "relative", display: "inline-block" }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: "visible" }}
        >
          <defs>
            <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="logo-stem" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94d3c1" />
              <stop offset="100%" stopColor="#4aaf94" />
            </linearGradient>
            <linearGradient id="logo-leafL" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#94d3c1" />
              <stop offset="100%" stopColor="#2e8b6e" />
            </linearGradient>
            <linearGradient id="logo-leafR" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b5e8d8" />
              <stop offset="100%" stopColor="#3aad8a" />
            </linearGradient>
            <linearGradient id="logo-coil" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4aaf94" />
              <stop offset="100%" stopColor="#ffdcc2" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Glow halo */}
          <motion.ellipse
            cx="28" cy="28" rx="22" ry="22"
            fill="rgba(148,211,193,0.15)"
            initial={animated ? { scale: 0.5, opacity: 0 } : false}
            animate={animated ? { scale: 1, opacity: 1 } : undefined}
            transition={sp(150, 18, 0)}
            style={{ transformOrigin: "28px 28px" }}
          />

          {/* Spring coil — bottom loop */}
          <motion.path
            d="M 14 50 C 10 46 16 43 21 45 C 26 47 24 50 28 50 C 32 50 30 47 35 45 C 40 43 46 46 42 50"
            stroke="url(#logo-coil)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            initial={animated ? { pathLength: 0, opacity: 0 } : false}
            animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
            transition={{ duration: 0.6, delay: 0, ease: "easeOut" }}
          />

          {/* Spring coil — upper loop */}
          <motion.path
            d="M 18 46 C 14 42 20 39 25 41 C 30 43 26 46 28 46 C 30 46 32 43 33 41 C 36 39 42 42 38 46"
            stroke="url(#logo-coil)"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            opacity={0.7}
            initial={animated ? { pathLength: 0, opacity: 0 } : false}
            animate={animated ? { pathLength: 1, opacity: 0.7 } : undefined}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          />

          {/* Stem */}
          <motion.line
            x1="28" y1="42" x2="28" y2="14"
            stroke="url(#logo-stem)"
            strokeWidth="2.8"
            strokeLinecap="round"
            initial={animated ? { pathLength: 0 } : false}
            animate={animated ? { pathLength: 1 } : undefined}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.2, 0.8, 0.4, 1] }}
            style={{ transformOrigin: "28px 42px" }}
          />

          {/* Left leaf */}
          <motion.path
            d="M 28 34 C 22 30 14 26 13 18 C 20 22 27 28 28 34 Z"
            fill="url(#logo-leafL)"
            initial={animated ? { scale: 0, rotate: 80 } : false}
            animate={animated ? { scale: 1, rotate: 0 } : undefined}
            transition={sp(280, 14, 0.5)}
            style={{ transformOrigin: "28px 34px" }}
          />

          {/* Right leaf */}
          <motion.path
            d="M 28 26 C 34 22 42 18 43 10 C 36 14 29 20 28 26 Z"
            fill="url(#logo-leafR)"
            initial={animated ? { scale: 0, rotate: -80 } : false}
            animate={animated ? { scale: 1, rotate: 0 } : undefined}
            transition={sp(280, 14, 0.6)}
            style={{ transformOrigin: "28px 26px" }}
          />

          {/* Top bud */}
          <motion.circle
            cx="28" cy="12" r="4.5"
            fill="#94d3c1"
            filter="url(#logo-glow)"
            initial={animated ? { scale: 0 } : false}
            animate={animated ? { scale: 1 } : undefined}
            transition={sp(380, 12, 0.72)}
            style={{ transformOrigin: "28px 12px" }}
          />

          {/* Sparkles */}
          {[
            { cx: 38, cy: 10, r: 2,   color: "#ffdcc2", delay: 0.9 },
            { cx: 16, cy: 22, r: 1.5, color: "#94d3c1", delay: 1.0 },
            { cx: 42, cy: 28, r: 1.5, color: "#ffdcc2", delay: 1.1 },
          ].map(({ cx, cy, r, color, delay: d }) => (
            <motion.circle
              key={`${cx}-${cy}`}
              cx={cx} cy={cy} r={r}
              fill={color}
              initial={animated ? { scale: 0, opacity: 0 } : false}
              animate={animated ? { scale: 1, opacity: 0.8 } : undefined}
              transition={sp(400, 12, d)}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
          ))}
        </svg>
      </div>

      {variant === "full" && (
        <motion.span
          initial={animated ? { opacity: 0, x: -8 } : false}
          animate={animated ? { opacity: 1, x: 0 } : undefined}
          transition={sp(200, 16, 0.5)}
          className="font-display text-lg font-bold text-white"
        >
          Spring Up
        </motion.span>
      )}
    </div>
  );
}
