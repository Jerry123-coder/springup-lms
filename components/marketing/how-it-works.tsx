"use client";

import { motion } from "framer-motion";
import { UserPlus, BookOpen, PenTool, Award } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Enrolment",
    description: "Young men at the Senior Correctional Centre are enrolled into the Spring Up programme with their own learning portal account.",
    icon: UserPlus,
    accent: "#94d3c1",
  },
  {
    step: "02",
    title: "Learn",
    description: "Students work through structured lessons across our 4 pillars — from Excel spreadsheets to African literature — at their own pace.",
    icon: BookOpen,
    accent: "#ffdcc2",
  },
  {
    step: "03",
    title: "Submit & Practice",
    description: "Each module includes hands-on assignments. Students upload their work directly through the platform for instructor review.",
    icon: PenTool,
    accent: "#94d3c1",
  },
  {
    step: "04",
    title: "Grow & Certify",
    description: "Instructors provide personalised feedback. Upon completion, students earn a recognised certificate of achievement.",
    icon: Award,
    accent: "#ffdcc2",
  },
];

function StepCard({ step, index }: { step: typeof steps[number]; index: number }) {
  return (
    <motion.div
      className="relative flex items-start gap-5"
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: "spring", stiffness: 100, damping: 16, delay: index * 0.1 }}
    >
      {/* Node */}
      <div className="relative flex flex-col items-center">
        <motion.div
          className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg"
          style={{ background: `${step.accent}18`, border: `1.5px solid ${step.accent}30` }}
          initial={{ scale: 0, rotate: -20 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: "spring", stiffness: 250, damping: 14, delay: 0.1 + index * 0.1 }}
          whileHover={{ scale: 1.12, rotate: -8 }}
        >
          <step.icon className="h-6 w-6" style={{ color: step.accent }} />
          <motion.span
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black"
            style={{ background: step.accent, color: "#001a16" }}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.2 + index * 0.1 }}
          >
            {step.step}
          </motion.span>
        </motion.div>

        {/* Connecting line (not last) */}
        {index < steps.length - 1 && (
          <motion.div
            className="mt-2 w-px"
            initial={{ height: 0 }}
            whileInView={{ height: 60 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1, ease: "easeOut" }}
            style={{ background: `linear-gradient(to bottom, ${step.accent}40, ${steps[index + 1].accent}20)` }}
          />
        )}
      </div>

      {/* Text */}
      <div className="pb-8 pt-1">
        <h3 className="mb-1.5 font-display text-lg font-bold text-foreground">{step.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Heading */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.65 }}
        >
          <motion.p
            className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            The Journey
          </motion.p>
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            How{" "}
            <span className="text-[#5dd494]">
              Spring Up
            </span>{" "}
            Works
          </h2>
          <motion.p
            className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            A simple, structured path from enrolment to certification — designed for an environment where every resource counts.
          </motion.p>
        </motion.div>

        {/* Desktop layout: card bento */}
        <div className="hidden md:block">
          <div className="grid grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                className="group relative overflow-hidden rounded-2xl border border-white/6 bg-card p-6 text-center shadow-ambient"
                initial={{ opacity: 0, y: 36, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: "spring", stiffness: 110, damping: 16, delay: i * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
              >
                {/* Glow on hover */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: `radial-gradient(circle at 50% 20%, ${s.accent}18 0%, transparent 65%)` }}
                />
                {/* Top accent */}
                <div className="absolute left-0 right-0 top-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${s.accent}, transparent)` }} />

                {/* Connector line between cards (not last) */}
                {i < steps.length - 1 && (
                  <motion.div
                    className="absolute -right-px top-1/2 h-0.5 w-5"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                    style={{ background: `linear-gradient(90deg, ${s.accent}60, transparent)`, originX: 0 }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  className="mx-auto mb-5 flex h-16 w-16 flex-col items-center justify-center rounded-2xl"
                  style={{ background: `${s.accent}14` }}
                  whileHover={{ scale: 1.1, rotate: -8 }}
                  transition={{ type: "spring", stiffness: 350, damping: 16 }}
                >
                  <s.icon className="h-7 w-7" style={{ color: s.accent }} />
                </motion.div>

                {/* Step badge */}
                <motion.div
                  className="mb-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
                  style={{ background: `${s.accent}20`, color: s.accent }}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ type: "spring", stiffness: 400, delay: 0.2 + i * 0.1 }}
                >
                  Step {s.step}
                </motion.div>

                <h3 className="mb-2 font-display text-lg font-bold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="space-y-0 md:hidden">
          {steps.map((s, i) => (
            <StepCard key={s.step} step={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
