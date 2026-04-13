"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Monitor, Briefcase, HeartHandshake, BookOpen } from "lucide-react";

const pillars = [
  {
    title: "Digital Literacy",
    description: "Essential ICT skills — from Microsoft Word and Excel to basic operating-system fluency — forming the bedrock of modern competence.",
    icon: Monitor,
    accent: "#5dd494",
    glow: "rgba(93,212,148,0.28)",
    cardBg: "linear-gradient(135deg, rgba(93,212,148,0.12) 0%, rgba(30,120,70,0.06) 100%)",
    borderColor: "rgba(93,212,148,0.22)",
    highlights: ["Microsoft Word", "Microsoft Excel", "Basic OS Skills"],
    span: "md:col-span-2",
  },
  {
    title: "Career Readiness",
    description:
      "Dedicated courses for presentation design (slides), prompt engineering, and Canva — plus communication and interview skills.",
    icon: Briefcase,
    accent: "#ffb97a",
    glow: "rgba(255,185,122,0.28)",
    cardBg: "linear-gradient(135deg, rgba(255,185,122,0.12) 0%, rgba(160,80,20,0.06) 100%)",
    borderColor: "rgba(255,185,122,0.22)",
    highlights: ["Presentation Design", "Prompt Engineering", "Graphic Design"],
    span: "md:col-span-1",
  },
  {
    title: "Life Skills & Values",
    description: "Building character alongside competence. Professional etiquette, ethical discipline, and the soft skills that define leaders.",
    icon: HeartHandshake,
    accent: "#7ec8ff",
    glow: "rgba(126,200,255,0.26)",
    cardBg: "linear-gradient(135deg, rgba(126,200,255,0.11) 0%, rgba(30,80,160,0.06) 100%)",
    borderColor: "rgba(126,200,255,0.22)",
    highlights: ["Professional Etiquette", "Ethics", "Discipline"],
    span: "md:col-span-1",
  },
  {
    title: "Cultural Identity",
    description: "Reconnecting with heritage through African literature and cultural storytelling — because knowing where you come from shapes where you go.",
    icon: BookOpen,
    accent: "#d49bff",
    glow: "rgba(212,155,255,0.26)",
    cardBg: "linear-gradient(135deg, rgba(212,155,255,0.11) 0%, rgba(90,30,140,0.06) 100%)",
    borderColor: "rgba(212,155,255,0.22)",
    highlights: ["African Literature", "Heritage Building", "Storytelling"],
    span: "md:col-span-2",
  },
] as const;

// 3D tilt card
function TiltCard({
  pillar,
  index,
}: {
  pillar: (typeof pillars)[number];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({ x: (py - 0.5) * -16, y: (px - 0.5) * 16 });
    setSpotlight({ x: px * 100, y: py * 100 });
  }

  function onLeave() {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  }

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden rounded-2xl cursor-pointer ${pillar.span}`}
      style={{ perspective: 800, background: pillar.cardBg, border: `1px solid ${pillar.borderColor}` }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 16, delay: 0.1 + index * 0.08 }}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.015 }}
    >
      {/* 3D tilt wrapper */}
      <motion.div
        className="relative h-full"
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Spotlight */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300"
          style={{
            opacity: hovered ? 0.6 : 0,
            background: `radial-gradient(circle at ${spotlight.x}% ${spotlight.y}%, ${pillar.glow} 0%, transparent 55%)`,
          }}
        />

        {/* Coloured top border */}
        <div
          className="absolute left-0 right-0 top-0 h-0.5 rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, transparent, ${pillar.accent}, transparent)` }}
        />

        {/* Card content */}
        <div className="p-7">
          {/* Icon */}
          <motion.div
            className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: `${pillar.accent}18` }}
            animate={hovered ? { scale: 1.1, rotate: -5 } : { scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 18 }}
          >
            <pillar.icon className="h-6 w-6" style={{ color: pillar.accent }} />
          </motion.div>

          <h3 className="mb-3 font-display text-xl font-bold text-foreground">{pillar.title}</h3>
          <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {pillar.highlights.map((tag) => (
              <motion.span
                key={tag}
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: `${pillar.accent}14`, color: pillar.accent }}
                whileHover={{ scale: 1.08, background: `${pillar.accent}28` }}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </div>

        {/* 3D lifted edge effect */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
          style={{
            opacity: hovered ? 1 : 0,
            boxShadow: `0 12px 40px -8px ${pillar.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

export function PillarsGrid() {
  const ref = useRef<HTMLElement>(null);

  return (
    <section id="curriculum" ref={ref} className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <motion.p
            className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Our Curriculum
          </motion.p>
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            The{" "}
            <motion.span
              className="inline-block text-[#5dd494]"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.2 }}
            >
              4 Pillars
            </motion.span>
          </h2>
          <motion.p
            className="mx-auto mt-4 max-w-2xl text-muted-foreground"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Every course at Spring Up falls under one of four pillars, designed to provide a holistic path from learning to reintegration.
          </motion.p>
        </motion.div>

        {/* Grid */}
        <div
          className="grid gap-4 md:grid-cols-3"
          style={{ perspective: 1000 }}
        >
          {pillars.map((p, i) => (
            <TiltCard key={p.title} pillar={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
