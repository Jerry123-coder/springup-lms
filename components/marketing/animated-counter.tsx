"use client";

import { useEffect, useState, useRef } from "react";

interface AnimatedCounterProps {
  value: string;
  duration?: number;
  delay?: number;
  className?: string;
}

function parseValue(value: string): { numeric: number; suffix: string; prefix: string } {
  const match = value.match(/^([^\d]*)([\d,]+)(.*)$/);
  if (!match) return { numeric: 0, suffix: value, prefix: "" };
  const [, prefix = "", numStr = "0", suffix = ""] = match;
  const numeric = parseInt(numStr.replace(/,/g, ""), 10) || 0;
  return { numeric, suffix, prefix };
}

export function AnimatedCounter({
  value,
  duration = 1500,
  delay = 0,
  className = "",
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(value);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  const { numeric, suffix, prefix } = parseValue(value);

  useEffect(() => {
    if (numeric === 0) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [hasAnimated, numeric]);

  useEffect(() => {
    if (!hasAnimated || numeric === 0) return;

    const startTime = Date.now() + delay;
    let rafId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < 0) {
        rafId = requestAnimationFrame(animate);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 2;
      const current = Math.round(numeric * eased);
      setDisplay(`${prefix}${current.toLocaleString()}${suffix}`);
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [hasAnimated, numeric, suffix, prefix, duration, delay]);

  return (
    <span ref={ref} className={className}>
      {numeric > 0 ? display : value}
    </span>
  );
}
