"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Monitor,
  Briefcase,
  HeartHandshake,
  BookOpen,
  Loader2,
  ArrowRight,
  Play,
} from "lucide-react";

import type { Course, CoursePillar, CourseCategory } from "@/lib/types/database";

// ── Progress info passed from the server ─────────────────────────
export type CourseProgressInfo = {
  totalLessons: number;
  submittedLessons: number;
  pct: number;
  firstLessonId: string | null;
  resumeLessonId: string | null;
};

// ── Course-relevant Unsplash images ──────────────────────────────
const CATEGORY_IMAGES: Record<CourseCategory, string> = {
  Word: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=75",
  Excel: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=75",
  Slides: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=75",
  Other: "",
};

const PILLAR_IMAGES: Record<CoursePillar, string> = {
  "Digital Literacy":
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=75",
  "Career Readiness":
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=75",
  "Life Skills":
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=75",
  "Cultural Identity":
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=75",
};

function getCourseImage(pillar: CoursePillar, category: CourseCategory): string {
  if (category !== "Other" && CATEGORY_IMAGES[category]) {
    return CATEGORY_IMAGES[category];
  }
  return PILLAR_IMAGES[pillar];
}

// ── Pillar colour tokens ─────────────────────────────────────────
const pillarIcons: Record<CoursePillar, React.ComponentType<{ className?: string }>> = {
  "Digital Literacy": Monitor,
  "Career Readiness": Briefcase,
  "Life Skills": HeartHandshake,
  "Cultural Identity": BookOpen,
};

const PILLAR_PILL_STYLES: Record<CoursePillar, string> = {
  "Digital Literacy": "bg-secondary text-primary",
  "Career Readiness": "bg-accent/50 text-accent-foreground",
  "Life Skills": "bg-secondary text-primary",
  "Cultural Identity": "bg-accent/50 text-accent-foreground",
};

export function CourseCard({
  course,
  progressInfo,
}: {
  course: Course;
  progressInfo?: CourseProgressInfo;
}) {
  const Icon = pillarIcons[course.pillar] ?? BookOpen;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const imageUrl = getCourseImage(course.pillar, course.category);
  const hasProgress = Boolean(progressInfo && progressInfo.submittedLessons > 0);
  const pillStyle = PILLAR_PILL_STYLES[course.pillar] ?? PILLAR_PILL_STYLES["Digital Literacy"];

  function goToCourse() {
    startTransition(() => {
      router.push(`/dashboard/student/courses/${course.id}`);
    });
  }

  return (
    <button
      type="button"
      onClick={goToCourse}
      className="group block w-full cursor-pointer rounded-[1.25rem] text-left transition-transform duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2"
      aria-label={`Open course: ${course.title}`}
    >
      <div className="relative h-full overflow-hidden rounded-[1.25rem] bg-card shadow-ambient transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md">
        {/* Loading overlay */}
        {isPending && (
          <div className="absolute inset-0 z-20 grid place-items-center rounded-[1.25rem] bg-background/55 backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-full bg-card/95 px-4 py-2 text-sm font-medium shadow-ambient">
              <Loader2 className="h-4 w-4 animate-spin" />
              Opening…
            </div>
          </div>
        )}

        {/* Course image */}
        <div className="relative h-36 w-full overflow-hidden sm:h-40">
          <Image
            src={imageUrl}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Subtle dark gradient at bottom for readability */}
          <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />

          {/* Lesson count badge */}
          {progressInfo && progressInfo.totalLessons > 0 && (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              <BookOpen className="h-3 w-3" />
              {progressInfo.totalLessons} lessons
            </div>
          )}

          {/* Progress pct overlay (bottom-left) */}
          {hasProgress && progressInfo && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              <span>{progressInfo.pct}% done</span>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="flex flex-col gap-3 p-5">
          {/* Pillar pill + icon */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${pillStyle}`}
            >
              <Icon className="h-3 w-3" />
              {course.pillar}
            </span>
          </div>

          {/* Title */}
          <h4 className="font-display text-[15px] font-semibold leading-snug tracking-tight text-foreground transition-colors duration-150 group-hover:text-primary">
            {course.title}
          </h4>

          {/* Description */}
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {course.description}
          </p>

          {/* Progress bar */}
          {progressInfo && progressInfo.totalLessons > 0 && (
            <div
              className="h-1.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={progressInfo.pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-gradient-primary transition-[width] duration-500"
                style={{ width: `${Math.max(hasProgress ? 6 : 0, progressInfo.pct)}%` }}
              />
            </div>
          )}

          {/* CTA row */}
          <div
            className={`mt-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-150 ${
              hasProgress
                ? "bg-gradient-primary text-[#f0f7f5]"
                : "bg-muted/60 text-foreground group-hover:bg-secondary group-hover:text-primary"
            }`}
          >
            {hasProgress ? (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                Continue Learning
              </>
            ) : (
              <>
                Start Learning
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
