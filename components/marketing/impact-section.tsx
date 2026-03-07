"use client";

import Image from "next/image";
import { TrendingUp, Clock, MapPin, Target } from "lucide-react";

import { AnimatedCounter } from "@/components/marketing/animated-counter";

const metrics = [
  {
    value: "120+",
    label: "Young Men Reached",
    description: "Students who have participated in Spring Up programmes since launch.",
    icon: TrendingUp,
    color: "text-sky-400",
  },
  {
    value: "1,200+",
    label: "Lesson Hours Delivered",
    description: "Hands-on instructional hours across all four curriculum pillars.",
    icon: Clock,
    color: "text-emerald-400",
  },
  {
    value: "Accra",
    label: "Senior Correctional Centre",
    description: "Roman Ridge, Ghana — our home base where transformation happens daily.",
    icon: MapPin,
    color: "text-violet-400",
  },
  {
    value: "92%",
    label: "Course Completion Rate",
    description: "Students who start a Spring Up module go on to complete it.",
    icon: Target,
    color: "text-amber-400",
  },
];

export function ImpactSection() {
  return (
    <section id="impact" className="relative overflow-hidden bg-[#0f2847] py-20 md:py-28">
      {/* Background image — Black youth, transformation/impact theme */}
      <Image
        src="https://images.unsplash.com/photo-1576267423048-15c0040fec78?w=1920&q=80"
        alt="Young Black men engaged in collaborative learning and growth"
        fill
        sizes="100vw"
        className="object-cover opacity-20"
      />
      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-[#0f2847]/70" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-14 text-center">
          <p
            className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-400 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
          >
            Our Impact
          </p>
          <h2
            className="text-3xl font-bold tracking-tight text-white opacity-0 animate-fade-in-up sm:text-4xl lg:text-5xl"
            style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
          >
            Numbers That Tell Our Story
          </h2>
          <p
            className="mx-auto mt-5 max-w-2xl text-lg text-blue-200/60 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.35s", animationFillMode: "forwards" }}
          >
            Every statistic represents a life being reshaped. Here is where we
            stand in our mission to empower young men through education.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm opacity-0 animate-fade-in-up transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
              style={{
                animationDelay: `${0.5 + i * 0.1}s`,
                animationFillMode: "forwards",
              }}
            >
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 ${m.color}`}
              >
                <m.icon className="h-5 w-5" />
              </div>
              <p className="text-3xl font-extrabold text-white">
                <AnimatedCounter
                  value={m.value}
                  duration={1200}
                  delay={600 + i * 120}
                />
              </p>
              <p className="mt-1 text-sm font-semibold text-sky-300">
                {m.label}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-blue-200/50">
                {m.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
