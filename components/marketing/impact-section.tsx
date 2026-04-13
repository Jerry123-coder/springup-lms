"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { TrendingUp, Clock, MapPin, Target } from "lucide-react";
import { AnimatedCounter } from "@/components/marketing/animated-counter";

const metrics = [
  { value: "120+",   label: "Young Men Reached",         description: "Students who have participated in Spring Up programmes since launch.", icon: TrendingUp, accent: "#94d3c1" },
  { value: "1,200+", label: "Lesson Hours Delivered",    description: "Hands-on instructional hours across all four curriculum pillars.",     icon: Clock,      accent: "#ffdcc2" },
  { value: "Accra",  label: "Senior Correctional Centre", description: "Roman Ridge, Ghana — our home base where transformation happens daily.", icon: MapPin,     accent: "#94d3c1" },
  { value: "92%",    label: "Course Completion Rate",     description: "Students who start a Spring Up module go on to complete it.",          icon: Target,     accent: "#ffdcc2" },
];

export function ImpactSection() {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      id="impact"
      ref={ref}
      className="relative scroll-mt-24 overflow-hidden py-20 md:py-28"
      style={{ background: "linear-gradient(148deg, #001a16 0%, #00342b 30%, #005a4d 60%, #0a5c52 100%)" }}
    >
      {/* Parallax background image */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <Image
          src="https://images.unsplash.com/photo-1576267423048-15c0040fec78?w=1920&q=80"
          alt="Young Black men engaged in collaborative learning"
          fill
          sizes="100vw"
          className="object-cover"
          style={{ opacity: 0.12 }}
        />
      </motion.div>

      {/* Overlays */}
      <div
        className="pointer-events-none absolute -right-24 -top-32 h-112 w-md rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(255,204,170,0.4) 0%, transparent 62%)" }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1.2px, transparent 1.2px)", backgroundSize: "22px 22px" }}
      />
      <div className="pointer-events-none absolute inset-0 scholar-hero-grain" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {/* Heading */}
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <motion.p
            className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#94d3c1]"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Our Impact
          </motion.p>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Numbers That Tell Our Story
          </h2>
          <motion.p
            className="mx-auto mt-5 max-w-2xl text-lg text-white/80"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Every statistic represents a life being reshaped. Here is where we stand in our mission to empower young men through education.
          </motion.p>
        </motion.div>

        {/* Metric cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              id={i === 1 ? "impact-focus" : undefined}
              className={`group relative overflow-hidden rounded-2xl p-6 backdrop-blur-sm ${
                i === 1 ? "scroll-mt-28" : ""
              }`}
              style={{ background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.08)" }}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ type: "spring", stiffness: 110, damping: 16, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
            >
              {/* Top accent */}
              <div
                className="absolute left-0 right-0 top-0 h-0.5"
                style={{ background: `linear-gradient(90deg, transparent, ${m.accent}, transparent)` }}
              />
              {/* Hover glow */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(circle at 50% 0%, ${m.accent}22 0%, transparent 60%)` }}
              />

              <div className="relative mb-4 flex items-center gap-3">
                <motion.div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${m.accent}20` }}
                  whileHover={{ scale: 1.12, rotate: -8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 14 }}
                >
                  <m.icon className="h-5 w-5" style={{ color: m.accent }} />
                </motion.div>

                <div>
                  <div className="font-display text-3xl font-extrabold leading-none text-white">
                    <AnimatedCounter value={m.value} duration={1400} delay={400 + i * 120} />
                  </div>
                  <div className="mt-0.5 text-xs font-semibold text-white/75">{m.label}</div>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-white/65">{m.description}</p>

              {/* Bottom progress bar */}
              <div className="mt-4 h-0.5 w-full rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.08, ease: "easeOut" }}
                  style={{ width: "70%", background: `linear-gradient(90deg, ${m.accent}, transparent)`, originX: 0 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
