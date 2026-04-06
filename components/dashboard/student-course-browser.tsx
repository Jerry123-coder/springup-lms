"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  Flame,
  PlayCircle,
  Search,
  Trophy,
} from "lucide-react";

import type { Course, CoursePillar } from "@/lib/types/database";
import type { CourseProgressInfo } from "@/components/dashboard/course-card";
import { CourseCard } from "@/components/dashboard/course-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Shared types (imported by server catalog component) ──────────
export type { CourseProgressInfo };

export type StreakDay = { label: string; active: boolean; isFuture: boolean };

export type MilestoneItem = {
  id: string;
  title: string;
  subtitle: string;
  courseId: string;
  lessonId: string;
};

export type BadgeItem = {
  id: string;
  courseTitle: string;
  courseId: string;
};

export type CatalogSidebarData = {
  streakDays: StreakDay[];
  streakCount: number;
  milestones: MilestoneItem[];
  badges: BadgeItem[];
};

export type LearningPathBlock = {
  id: string;
  title: string;
  subtitle: string;
  courses: Course[];
};

const pillarOrder: CoursePillar[] = [
  "Digital Literacy",
  "Career Readiness",
  "Life Skills",
  "Cultural Identity",
];

// ── Streak widget ────────────────────────────────────────────────
function StreakWidget({
  streakDays,
  streakCount,
}: {
  streakDays: StreakDay[];
  streakCount: number;
}) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-ambient">
      <div className="mb-4 flex items-center gap-2">
        <Flame className="h-5 w-5 text-[#ffdcc2]" />
        <h3 className="font-display text-sm font-semibold">Daily Streaks</h3>
      </div>

      <div className="flex items-end justify-between gap-1">
        {streakDays.map((day) => (
          <div key={day.label} className="flex flex-col items-center gap-1.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all ${
                day.active
                  ? "bg-gradient-primary text-[#f0f7f5] shadow-sm"
                  : day.isFuture
                  ? "bg-muted text-muted-foreground/40"
                  : "border-2 border-muted bg-transparent text-muted-foreground/40"
              }`}
            >
              {day.active ? <Check className="h-4 w-4" /> : null}
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">
              {day.label}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        {streakCount > 0 ? (
          <>
            <span className="font-semibold text-primary">{streakCount} day{streakCount !== 1 ? "s" : ""} in a row!</span>{" "}
            Keep the momentum.
          </>
        ) : (
          "Start a lesson today to begin your streak."
        )}
      </p>
    </div>
  );
}

// ── Milestones widget ────────────────────────────────────────────
function MilestonesWidget({ milestones }: { milestones: MilestoneItem[] }) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-ambient">
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h3 className="font-display text-sm font-semibold">Up Next</h3>
      </div>

      {milestones.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No upcoming lessons yet. Open a course to get started.
        </p>
      ) : (
        <div className="space-y-3">
          {milestones.map((m) => (
            <Link
              key={m.id}
              href={`/dashboard/student/courses/${m.courseId}/lessons/${m.lessonId}`}
              className="group flex items-start gap-3 rounded-xl bg-muted/50 p-3 transition-colors hover:bg-secondary"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-card">
                <BookOpen className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground group-hover:text-primary">
                  {m.title}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                  {m.subtitle}
                </p>
              </div>
              <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Badges widget ────────────────────────────────────────────────
function BadgesWidget({ badges }: { badges: BadgeItem[] }) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-ambient">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-[#ffdcc2]" />
          <h3 className="font-display text-sm font-semibold">Badges Won</h3>
        </div>
        <Link
          href="/dashboard/student/certificates"
          className="text-[10px] font-semibold text-primary hover:underline"
        >
          View All
        </Link>
      </div>

      {badges.length === 0 ? (
        <div className="flex flex-col items-center py-4 text-center">
          <div className="mb-2 flex items-center justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground/30"
              >
                <Award className="h-5 w-5" />
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Complete a course to earn your first badge.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <div
              key={b.id}
              title={b.courseTitle}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-primary shadow-sm"
            >
              <Trophy className="h-5 w-5 text-[#ffdcc2]" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Learning path banner ─────────────────────────────────────────
function LearningPathBanner({
  learningPath,
  courseProgressMap,
}: {
  learningPath: LearningPathBlock[];
  courseProgressMap: Record<string, CourseProgressInfo>;
}) {
  // Flatten all courses in order to determine overall progress + active course
  const allCourses = learningPath.flatMap((b) => b.courses);
  const totalLessons = allCourses.reduce(
    (s, c) => s + (courseProgressMap[c.id]?.totalLessons ?? 0),
    0,
  );
  const doneLessons = allCourses.reduce(
    (s, c) => s + (courseProgressMap[c.id]?.submittedLessons ?? 0),
    0,
  );
  const overallPct =
    totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;

  // Find the first course that isn't 100% complete
  const activeCourse = allCourses.find((c) => {
    const p = courseProgressMap[c.id];
    return !p || p.pct < 100;
  });
  const activeProgress = activeCourse ? courseProgressMap[activeCourse.id] : null;

  const resumeHref =
    activeCourse && activeProgress?.resumeLessonId
      ? `/dashboard/student/courses/${activeCourse.id}/lessons/${activeProgress.resumeLessonId}`
      : activeCourse && activeProgress?.firstLessonId
        ? `/dashboard/student/courses/${activeCourse.id}/lessons/${activeProgress.firstLessonId}`
        : "/dashboard/student/progress";

  const completedCount = allCourses.filter(
    (c) => (courseProgressMap[c.id]?.pct ?? 0) === 100,
  ).length;

  return (
    <section
      className="relative overflow-hidden rounded-[1.75rem] shadow-ambient"
      style={{
        background:
          "linear-gradient(135deg, #001a16 0%, #00342b 40%, #005a4d 75%, #0a7a6a 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,204,170,0.9) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full opacity-10 blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(148,211,193,0.8) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
        {/* Left: text + CTA */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#94d3c1]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#94d3c1]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#94d3c1]" />
              Learning Path
            </span>
            {completedCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold text-white/60">
                <CheckCircle2 className="h-3 w-3 text-[#94d3c1]" />
                {completedCount}/{allCourses.length} complete
              </span>
            )}
          </div>
          <h3 className="font-display text-xl font-bold text-[#f0f7f5] sm:text-2xl">
            {activeCourse
              ? activeProgress && activeProgress.submittedLessons > 0
                ? `Continue: ${activeCourse.title}`
                : `Start: ${activeCourse.title}`
              : "All courses complete — great work!"}
          </h3>
          <p className="mt-1.5 text-sm text-[#c8ebe2]/65 max-w-lg">
            {activeCourse
              ? activeProgress && activeProgress.pct > 0
                ? `${activeProgress.pct}% through this course · ${activeProgress.totalLessons - activeProgress.submittedLessons} lesson${activeProgress.totalLessons - activeProgress.submittedLessons !== 1 ? "s" : ""} remaining`
                : `${activeProgress?.totalLessons ?? 0} lessons to complete`
              : "Head to your learning path to review everything."}
          </p>

          {/* Module chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {allCourses.slice(0, 6).map((c) => {
              const p = courseProgressMap[c.id];
              const done = (p?.pct ?? 0) === 100;
              const isActive = c.id === activeCourse?.id;
              return (
                <span
                  key={c.id}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
                    done
                      ? "bg-[#94d3c1]/20 text-[#94d3c1]"
                      : isActive
                        ? "bg-[#ffdcc2]/20 text-[#ffdcc2] ring-1 ring-[#ffdcc2]/40"
                        : "bg-white/8 text-white/40"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : isActive ? (
                    <PlayCircle className="h-3 w-3" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                  )}
                  {c.title}
                </span>
              );
            })}
            {allCourses.length > 6 && (
              <span className="inline-flex items-center rounded-full bg-white/8 px-3 py-1 text-[11px] font-semibold text-white/40">
                +{allCourses.length - 6} more
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={resumeHref}
              className="inline-flex items-center gap-2 rounded-xl bg-[#94d3c1] px-5 py-2.5 text-sm font-bold text-[#001a16] transition-opacity hover:opacity-90"
            >
              {activeCourse && activeProgress && activeProgress.submittedLessons > 0
                ? "Resume"
                : "Start Now"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/student/progress"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-[#f0f7f5] transition-colors hover:bg-white/20"
            >
              Full Roadmap
            </Link>
          </div>
        </div>

        {/* Right: overall progress ring */}
        <div className="shrink-0 flex flex-col items-center gap-2 sm:pr-2">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle
              cx="48"
              cy="48"
              r="38"
              fill="none"
              stroke="rgba(255,255,255,0.10)"
              strokeWidth="7"
            />
            <circle
              cx="48"
              cy="48"
              r="38"
              fill="none"
              stroke="#94d3c1"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 38}
              strokeDashoffset={
                2 * Math.PI * 38 - (overallPct / 100) * 2 * Math.PI * 38
              }
              transform="rotate(-90 48 48)"
            />
            <text
              x="48"
              y="44"
              textAnchor="middle"
              fontSize="18"
              fontWeight="700"
              fill="white"
              fontFamily="inherit"
            >
              {overallPct}%
            </text>
            <text
              x="48"
              y="58"
              textAnchor="middle"
              fontSize="8"
              fill="rgba(255,255,255,0.45)"
              fontFamily="inherit"
              letterSpacing="0.08em"
            >
              OVERALL
            </text>
          </svg>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94d3c1]/50">
            {doneLessons}/{totalLessons} lessons
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Main browser ─────────────────────────────────────────────────
export function StudentCourseBrowser({
  courses,
  learningPath,
  courseProgressMap = {},
  sidebarData,
}: {
  courses: Course[];
  learningPath: LearningPathBlock[];
  courseProgressMap?: Record<string, CourseProgressInfo>;
  sidebarData?: CatalogSidebarData;
}) {
  const [pillar, setPillar] = useState<CoursePillar | "All">("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      if (pillar !== "All" && c.pillar !== pillar) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.pillar.toLowerCase().includes(q)
      );
    });
  }, [courses, pillar, query]);

  const groupedByPillar = useMemo(() => {
    const map = new Map<CoursePillar, Course[]>();
    for (const p of pillarOrder) map.set(p, []);
    for (const c of filtered) map.get(c.pillar)?.push(c);
    return map;
  }, [filtered]);

  const defaultSidebar: CatalogSidebarData = {
    streakDays: ["Mon", "Tue", "Wed", "Thu", "Fri"].map((label) => ({
      label,
      active: false,
      isFuture: false,
    })),
    streakCount: 0,
    milestones: [],
    badges: [],
  };

  const sidebar = sidebarData ?? defaultSidebar;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_288px]">
      {/* ── Main catalog column ─────────────────────────────────── */}
      <div className="min-w-0 space-y-14 md:space-y-16">
        {/* Learning path banner */}
        {learningPath.length > 0 && (
          <LearningPathBanner
            learningPath={learningPath}
            courseProgressMap={courseProgressMap}
          />
        )}

        {/* Explore everything */}
        <section className="rounded-[1.75rem] bg-muted/40 p-6 shadow-ambient sm:p-8 md:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                Explore everything
              </h3>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">
                Filter by pillar or search titles and descriptions.
              </p>
            </div>
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the catalogue…"
                className="h-12 rounded-2xl border-0 bg-card pl-11 text-base shadow-ambient placeholder:text-muted-foreground/70"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              type="button"
              variant={pillar === "All" ? "default" : "secondary"}
              size="sm"
              onClick={() => setPillar("All")}
              className="min-h-10 rounded-full px-4"
            >
              All pillars
            </Button>
            {pillarOrder.map((p) => (
              <Button
                key={p}
                type="button"
                variant={pillar === p ? "default" : "secondary"}
                size="sm"
                onClick={() => setPillar(p)}
                className="min-h-10 rounded-full px-4"
              >
                {p}
              </Button>
            ))}
          </div>

          <div className="mt-10 space-y-12">
            {pillar === "All" ? (
              pillarOrder.map((p) => {
                const list = groupedByPillar.get(p) ?? [];
                if (list.length === 0) return null;
                return (
                  <div key={p}>
                    <div className="mb-5">
                      <h4 className="font-display text-base font-semibold">{p}</h4>
                      <p className="text-xs text-muted-foreground">
                        {list.length} course{list.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                      {list.map((course) => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          progressInfo={courseProgressMap[course.id]}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    progressInfo={courseProgressMap[course.id]}
                  />
                ))}
              </div>
            )}

            {filtered.length === 0 && (
              <div className="rounded-2xl bg-card px-6 py-14 text-center shadow-ambient">
                <p className="font-display font-medium text-foreground">No matches</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try another pillar or a different search keyword.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Right sidebar ────────────────────────────────────────── */}
      <aside className="hidden space-y-4 xl:block">
        <div className="sticky top-20 space-y-4">
          <StreakWidget
            streakDays={sidebar.streakDays}
            streakCount={sidebar.streakCount}
          />
          <MilestonesWidget milestones={sidebar.milestones} />
          <BadgesWidget badges={sidebar.badges} />
        </div>
      </aside>
    </div>
  );
}
