"use client";

import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const values = [
  "Digital skills training in a resource-limited environment",
  "Certified instructors with real-world industry experience",
  "Culturally relevant curriculum rooted in African identity",
  "Mentorship and career guidance beyond the classroom",
  "A pathway to reintegration through education",
];

const stats = [
  { value: "120+",   label: "Students Trained",  accent: "#5dd494", bg: "linear-gradient(145deg, rgba(93,212,148,0.18) 0%, rgba(20,80,50,0.12) 100%)", border: "rgba(93,212,148,0.25)" },
  { value: "4",      label: "Curriculum Pillars", accent: "#ffb97a", bg: "linear-gradient(145deg, rgba(255,185,122,0.16) 0%, rgba(120,55,15,0.10) 100%)", border: "rgba(255,185,122,0.25)" },
  { value: "92%",    label: "Completion Rate",    accent: "#7ec8ff", bg: "linear-gradient(145deg, rgba(126,200,255,0.15) 0%, rgba(20,60,130,0.10) 100%)", border: "rgba(126,200,255,0.25)" },
  { value: "1,200+", label: "Lesson Hours",       accent: "#d49bff", bg: "linear-gradient(145deg, rgba(212,155,255,0.16) 0%, rgba(70,20,110,0.10) 100%)", border: "rgba(212,155,255,0.25)" },
];

export function MissionSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-14 md:grid-cols-2 md:gap-16">

          {/* Bento stat grid */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl p-6"
                style={{
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                  marginTop: i === 1 ? "2rem" : i === 2 ? "-1.5rem" : i === 3 ? "0.5rem" : "0",
                }}
                initial={{ opacity: 0, scale: 0.85, rotate: i % 2 === 0 ? -4 : 4 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: "spring", stiffness: 130, damping: 14, delay: i * 0.08 }}
                whileHover={{ scale: 1.04, rotate: i % 2 === 0 ? -2 : 2 }}
              >
                {/* Hover glow */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: `radial-gradient(circle at 50% 50%, ${s.accent}30 0%, transparent 65%)` }}
                />
                {/* Accent pulse dot */}
                <motion.div
                  className="absolute right-3 top-3 h-2 w-2 rounded-full"
                  style={{ background: s.accent }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                />

                <p className="relative text-center">
                  <motion.span
                    className="block font-display text-4xl font-extrabold leading-none"
                    style={{ color: s.accent }}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                  >
                    {s.value}
                  </motion.span>
                  <span className="mt-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {s.label}
                  </span>
                </p>
              </motion.div>
            ))}
          </div>

          {/* Text */}
          <div>
            <motion.p
              className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Our Mission
            </motion.p>

            <motion.h2
              className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.65, delay: 0.2 }}
            >
              More Than Education —{" "}
              <span className="text-[#5dd494]">
                A Second Chance
              </span>
            </motion.h2>

            <motion.p
              className="mt-5 text-lg leading-relaxed text-muted-foreground"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Project Spring Up operates inside Ghana&apos;s Senior Correctional Centre in Roman Ridge, Accra.
              We believe that every young person — regardless of their past — deserves access to quality
              education and the tools to build a dignified future.
            </motion.p>

            <motion.p
              className="mt-4 text-base leading-relaxed text-muted-foreground"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.38 }}
            >
              Our programme combines hands-on digital skills training with life coaching, career readiness
              workshops, and a deep reconnection with African cultural identity. We don&apos;t just teach
              computers — we build character, confidence, and community.
            </motion.p>

            <ul className="mt-8 space-y-3">
              {values.map((v, i) => (
                <motion.li
                  key={v}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ type: "spring", stiffness: 140, damping: 18, delay: i * 0.07 }}
                  whileHover={{ x: 4 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: -10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 12 }}
                  >
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  </motion.div>
                  <span className="text-sm text-foreground/80">{v}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
