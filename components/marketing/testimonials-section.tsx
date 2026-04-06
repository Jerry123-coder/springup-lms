 "use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Before Spring Up, I had never touched a computer. Now I can type a full document in Microsoft Word, create spreadsheets, and I am learning how to use AI to research. It has changed how I see my future.",
    name: "Daniel A.",
    role: "Student, Cohort 2",
    accent: "border-l-primary/50",
    initials: "DA",
    color: "bg-secondary text-primary",
  },
  {
    quote:
      "Before Spring Up, I had never touched a computer. Now I can type a full document in Microsoft Word, create spreadsheets, and I am learning how to use AI to research. It has changed how I see my future.",
    name: "Kevin B.",
    role: "Student, Cohort 2",
    accent: "border-l-primary/50",
    initials: "KB",
    color: "bg-secondary text-primary",
  },
  {
    quote:
      "Watching these young men go from not knowing how to open a browser to building their own presentations — that transformation is what keeps us going. Spring Up proves that potential has no postcode.",
    name: "Phoebe France",
    role: "Programme Director",
    accent: "border-l-accent/70",
    initials: "PF",
    color: "bg-accent/40 text-accent-foreground",
  },
  {
    quote:
      "Watching these young men go from not knowing how to open a browser to building their own presentations — that transformation is what keeps us going. Spring Up proves that potential has no postcode.",
    name: "Patience Dogbe",
    role: "Programme Director",
    accent: "border-l-accent/70",
    initials: "PD",
    color: "bg-accent/40 text-accent-foreground",
  },
  {
    quote:
      "The cultural identity classes gave me something I didn't know I was missing. Reading about African writers who overcame hardship made me realise my story isn't over — it's just beginning.",
    name: "Emmanuel K.",
    role: "Student, Cohort 1",
    accent: "border-l-primary/50",
    initials: "EK",
    color: "bg-secondary text-primary",
  },
];

export function TestimonialsSection() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const total = testimonials.length;

  const scrollToIndex = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = ((index % total) + total) % total;
      const child = track.children.item(clamped) as HTMLElement | null;
      if (!child) return;
      track.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
      setActive(clamped);
    },
    [total]
  );

  const onPrev = useCallback(
    () => scrollToIndex(active - 1),
    [active, scrollToIndex]
  );
  const onNext = useCallback(
    () => scrollToIndex(active + 1),
    [active, scrollToIndex]
  );

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      scrollToIndex(active + 1);
    }, 5500);
    return () => window.clearInterval(id);
  }, [active, paused, scrollToIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    const onScroll = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => {
        const children = Array.from(track.children) as HTMLElement[];
        const center = track.scrollLeft + track.clientWidth / 2;
        let bestIdx = 0;
        let bestDist = Number.POSITIVE_INFINITY;
        for (let i = 0; i < children.length; i++) {
          const el = children[i];
          const elCenter = el.offsetLeft + el.clientWidth / 2;
          const dist = Math.abs(center - elCenter);
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
          }
        }
        setActive(bestIdx);
      });
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(raf);
      track.removeEventListener("scroll", onScroll);
    };
  }, []);

  const dots = useMemo(() => Array.from({ length: total }, (_, i) => i), [total]);

  return (
    <section className="bg-muted/40 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Voices of Spring Up
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Stories from the Programme
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Real words from students and staff at the Senior Correctional
            Centre. Names have been changed to protect privacy.
          </p>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div className="mb-6 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Swipe to explore, or use the arrows.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPrev}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground shadow-ambient transition-colors hover:bg-secondary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-label="Previous testimonial"
              >
                <span aria-hidden className="text-lg leading-none">
                  ‹
                </span>
              </button>
              <button
                type="button"
                onClick={onNext}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground shadow-ambient transition-colors hover:bg-secondary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-label="Next testimonial"
              >
                <span aria-hidden className="text-lg leading-none">
                  ›
                </span>
              </button>
            </div>
          </div>

          <div
            ref={trackRef}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
          >
            {testimonials.map((t) => (
              <div
                key={t.name}
                className={`group snap-start w-[85%] shrink-0 rounded-2xl border-l-4 ${t.accent} bg-card p-6 shadow-ambient transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:w-[70%] sm:p-8 md:w-[48%] lg:w-[32%]`}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary transition-transform duration-300 group-hover:scale-110">
                    <Quote className="h-5 w-5" />
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/10 to-accent/10" />
                </div>

                <blockquote className="mb-6 text-sm leading-relaxed text-foreground/85 sm:text-[15px]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-transform duration-300 group-hover:scale-110 ${t.color}`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            {dots.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToIndex(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === active
                    ? "w-8 bg-primary"
                    : "w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/45"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
                aria-current={i === active ? "true" : "false"}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
