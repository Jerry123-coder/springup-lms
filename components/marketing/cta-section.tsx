"use client";

import { useRef } from "react";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

import { Button } from "@/components/ui/button";
import { LoadingLink } from "@/components/ui/loading-link";
import { SupportDrawer } from "@/components/marketing/support-drawer";
import { SpringLogo } from "@/components/marketing/spring-logo";

// Floating ring decoration
function Ring({ size, delay, duration }: { size: number; delay: number; duration: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
      style={{ width: size, height: size, borderColor: "rgba(148,211,193,0.08)" }}
      animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.08, 0.3] }}
      transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

export function CTASection() {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const plantY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const plantRotate = useTransform(scrollYProgress, [0, 1], [-3, 3]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-24 md:py-36"
      style={{ background: "linear-gradient(148deg, #000d0a 0%, #001a16 25%, #00342b 55%, #004a3c 80%, #0a5c52 100%)" }}
    >
      {/* Animated rings */}
      {[240, 380, 520, 660, 800].map((sz, i) => (
        <Ring key={sz} size={sz} delay={i * 0.4} duration={5 + i} />
      ))}

      {/* Warm centre glow */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-144 w-xl -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(255,204,170,0.6) 0%, transparent 60%)" }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.28, 0.15] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Dot grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
      <div className="pointer-events-none absolute inset-0 scholar-hero-grain" />

      {/* Floating spring logo – top right decorative */}
      <motion.div
        className="pointer-events-none absolute -right-10 top-8 opacity-[0.15] lg:opacity-[0.1]"
        style={{ y: plantY, rotate: plantRotate }}
      >
        <SpringLogo size={200} variant="mark" animated={false} />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">

        {/* Animated heart/spark icon */}
        <motion.div
          className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: "rgba(255,220,194,0.12)", border: "1px solid rgba(255,220,194,0.2)" }}
          initial={{ scale: 0, rotate: -30 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ type: "spring", stiffness: 280, damping: 14, delay: 0.1 }}
          whileHover={{ scale: 1.12, rotate: 8 }}
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Heart className="h-8 w-8 text-[#ffdcc2]" />
          </motion.div>
        </motion.div>

        {/* Headline */}
        <motion.h2
          className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Every Skill Learned Is a{" "}
          <span className="inline-block text-[#5dd494]">
            Life Changed
          </span>
        </motion.h2>

        <motion.p
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/80"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.65, delay: 0.35 }}
        >
          Your support provides laptops, internet access, learning materials, and instructor
          training for young men who deserve a second chance. Even a small contribution
          creates ripples of transformation.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <SupportDrawer>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button
                size="lg"
                className="w-full gap-2 bg-gradient-primary text-base font-semibold text-white shadow-lg hover:shadow-primary/30 sm:w-auto"
              >
                <Heart className="h-4 w-4" />
                Donate Now
              </Button>
            </motion.div>
          </SupportDrawer>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <LoadingLink
              href="/login"
              size="lg"
              variant="outline"
              className="w-full gap-2 border-white/25 bg-white/8 text-base text-white/90 backdrop-blur-sm hover:bg-white/14 hover:text-white sm:w-auto"
            >
              Join as Volunteer
              <ArrowRight className="h-4 w-4" />
            </LoadingLink>
          </motion.div>
        </motion.div>

        {/* Sparkle row */}
        <motion.div
          className="mt-10 flex items-center justify-center gap-2 text-white/45"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <p className="text-xs font-medium">
            All donations go directly to programme operations at the Senior Correctional Centre, Roman Ridge, Accra.
          </p>
          <Sparkles className="h-3.5 w-3.5" />
        </motion.div>
      </div>
    </section>
  );
}
