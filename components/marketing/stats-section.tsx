"use client";

import { motion } from "framer-motion";
import { Users, BookOpen, Award, TrendingUp } from "lucide-react";
import { AnimatedCounter } from "@/components/marketing/animated-counter";

const stats = [
  { label: "Students Enrolled",  value: "120+", icon: Users,      accent: "#94d3c1", delay: 0    },
  { label: "Courses Delivered",  value: "24",   icon: BookOpen,   accent: "#ffdcc2", delay: 0.08 },
  { label: "Certifications",     value: "86",   icon: Award,      accent: "#94d3c1", delay: 0.16 },
  { label: "Completion Rate",    value: "92%",  icon: TrendingUp, accent: "#ffdcc2", delay: 0.24 },
];

export function StatsSection() {
  return (
    <section className="relative -mt-8 py-20 md:py-24">
      {/* Subtle gradient wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(148,211,193,0.06) 0%, transparent 100%)" }}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Heading */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.65 }}
        >
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Real impact, real numbers
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Every statistic represents a life being reshaped through education and opportunity.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ type: "spring", stiffness: 130, damping: 16, delay: stat.delay }}
              className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-ambient"
            >
              {/* Accent top line */}
              <div
                className="absolute left-0 right-0 top-0 h-0.5 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: `linear-gradient(90deg, transparent, ${stat.accent}, transparent)` }}
              />

              {/* Background glow on hover */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(circle at 50% 0%, ${stat.accent}14 0%, transparent 65%)` }}
              />

              <div className="relative flex items-start gap-4">
                <motion.div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: `${stat.accent}18` }}
                  whileHover={{ scale: 1.12, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 14 }}
                >
                  <stat.icon className="h-5 w-5" style={{ color: stat.accent }} />
                </motion.div>

                <div>
                  <p className="font-display text-3xl font-extrabold tabular-nums text-foreground">
                    <AnimatedCounter value={stat.value} duration={1400} delay={300 + i * 120} />
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>

              {/* Bottom progress bar (decorative) */}
              <motion.div
                className="mt-5 h-0.5 w-full rounded-full bg-muted/40"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.9, delay: 0.2 + stat.delay, ease: "easeOut" }}
                style={{ originX: 0 }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: "72%", background: `linear-gradient(90deg, ${stat.accent}, transparent)` }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
