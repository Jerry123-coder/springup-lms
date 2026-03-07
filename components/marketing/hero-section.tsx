"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  Users,
  BookOpen,
  Award,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/marketing/animated-counter";

const stats = [
  { label: "Students Enrolled", value: "120+", icon: Users },
  { label: "Courses Delivered", value: "24", icon: BookOpen },
  { label: "Certifications", value: "86", icon: Award },
];

export function HeroSection() {
  return (
    <section id="mission" className="relative overflow-hidden">
      {/* Background image */}
      <Image
        src="https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=1920&q=80"
        alt="Young Black students learning digital skills together in a classroom"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      {/* Dark overlay — stronger for text legibility */}
      <div className="absolute inset-0 bg-[#0f2847]/96" />
      {/* Subtle gradient accents */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.15)_0%,transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.1)_0%,transparent_50%)]" />

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 md:pb-32 md:pt-28 lg:pb-36 lg:pt-32">
        <div className="flex flex-col items-center text-center">
          <Badge
            className="mb-6 gap-1.5 border-sky-400/20 bg-sky-400/10 px-4 py-1.5 text-sky-300 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Project Spring Up &mdash; Roman Ridge, Accra
          </Badge>

          <h1
            className="max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white opacity-0 animate-fade-in-up sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ animationDelay: "0.25s", animationFillMode: "forwards" }}
          >
            Shaping Destinies{" "}
            <br className="hidden sm:block" />
            through{" "}
            <span className="bg-linear-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
              Digital Literacy
            </span>
          </h1>

          <p
            className="mt-6 max-w-2xl text-lg leading-relaxed text-blue-100/80 opacity-0 animate-fade-in-up sm:text-xl"
            style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
          >
            Equipping young men at Ghana&apos;s Senior Correctional Centre with
            technology skills, career readiness, ethical values, and cultural
            pride — building a resolute future, one lesson at a time.
          </p>

          <div
            className="mt-10 flex flex-col gap-3 sm:flex-row opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.55s", animationFillMode: "forwards" }}
          >
            <Button
              size="lg"
              className="gap-2 bg-sky-500 text-base font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-sky-400 active:scale-[0.98]"
              asChild
            >
              <Link href="/login">
                Enter Learning Portal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 text-base text-blue-100 transition-all duration-200 hover:scale-[1.02] hover:bg-white/10 hover:text-white active:scale-[0.98]"
              asChild
            >
              <a href="#curriculum">Explore Curriculum</a>
            </Button>
          </div>
        </div>

        {/* Stat counters with count-up */}
        <div
          className="mx-auto mt-16 grid max-w-lg gap-4 opacity-0 animate-fade-in-up sm:max-w-none sm:grid-cols-3 md:mt-20"
          style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-300">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  <AnimatedCounter
                    value={stat.value}
                    duration={1200}
                    delay={800 + i * 150}
                  />
                </p>
                <p className="text-sm text-blue-200/60">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Layered animated wave divider — flowing water effect */}
      <div className="absolute bottom-0 left-0 right-0 h-[72px] overflow-hidden">
        {/* Base wave — solid, main flow */}
        <div className="absolute inset-0 flex w-[200%] animate-wave-flow">
          <svg
            viewBox="0 0 1440 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="block h-full w-1/2 shrink-0"
            preserveAspectRatio="none"
          >
            <path
              d="M0 72V42C180 18 360 54 540 36C720 18 900 54 1080 36C1260 18 1440 42V72H0Z"
              className="fill-background"
            />
          </svg>
          <svg
            viewBox="0 0 1440 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="block h-full w-1/2 shrink-0"
            preserveAspectRatio="none"
          >
            <path
              d="M0 72V42C180 18 360 54 540 36C720 18 900 54 1080 36C1260 18 1440 42V72H0Z"
              className="fill-background"
            />
          </svg>
        </div>
        {/* Overlay wave — offset phase, more transparent */}
        <div
          className="absolute inset-0 flex w-[200%] animate-wave-flow-slow opacity-60"
          style={{ animationDelay: "-5s" }}
        >
          <svg
            viewBox="0 0 1440 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="block h-full w-1/2 shrink-0"
            preserveAspectRatio="none"
          >
            <path
              d="M0 72V48C180 24 360 60 540 42C720 24 900 60 1080 42C1260 24 1440 48V72H0Z"
              className="fill-background"
            />
          </svg>
          <svg
            viewBox="0 0 1440 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="block h-full w-1/2 shrink-0"
            preserveAspectRatio="none"
          >
            <path
              d="M0 72V48C180 24 360 60 540 42C720 24 900 60 1080 42C1260 24 1440 48V72H0Z"
              className="fill-background"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
