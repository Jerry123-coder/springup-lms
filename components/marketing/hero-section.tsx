"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section id="mission" className="relative overflow-hidden">
      {/* Background image */}
      <Image
        src="https://images.unsplash.com/photo-1523240795612-9a1b4cd4f2e7?w=1920&q=80"
        alt="Young people learning together with hope and enthusiasm for the future"
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

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6 md:pb-24 md:pt-28 lg:pb-28 lg:pt-32">
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
      </div>

      {/* Clean wave divider — single smooth curve */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
        <svg
          viewBox="0 0 1440 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 64V32c120-16 240 16 360 8 120-8 240-24 360-8s240 24 360 8c120-16 240-8 360 8V64H0Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
}
