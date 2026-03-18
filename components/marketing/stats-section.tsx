"use client";

import { useEffect, useRef, useState } from "react";
import { Users, BookOpen, Award } from "lucide-react";
import { AnimatedCounter } from "@/components/marketing/animated-counter";

const stats = [
  { label: "Students Enrolled", value: "120+", icon: Users },
  { label: "Courses Delivered", value: "24", icon: BookOpen },
  { label: "Certifications", value: "86", icon: Award },
];

export function StatsSection() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setInView(true),
      { threshold: 0.2, rootMargin: "50px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative -mt-8 bg-background py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className="mb-10 text-center md:mb-12"
          style={
            inView
              ? {
                  animation: "fade-in-up 0.6s ease-out forwards",
                  animationFillMode: "forwards",
                }
              : { opacity: 0 }
          }
        >
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Real impact, real numbers
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Every statistic represents a life being reshaped through education and opportunity at Roman Ridge.
          </p>
        </div>
        <div className="grid max-w-lg gap-4 sm:max-w-none sm:grid-cols-3">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-xl border bg-card px-6 py-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              style={
                inView
                  ? {
                      animation: "fade-in-up 0.6s ease-out forwards",
                      animationDelay: `${i * 0.1}s`,
                      animationFillMode: "forwards",
                    }
                  : { opacity: 0 }
              }
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  <AnimatedCounter
                    value={stat.value}
                    duration={1200}
                    delay={400 + i * 150}
                  />
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
