"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  Filter,
  Loader2,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { deleteCourse } from "@/lib/actions/admin";
import type { CourseRow } from "@/app/dashboard/admin/courses/page";
import type { CourseCategory } from "@/lib/types/database";
import { cn } from "@/lib/utils";

const PILLAR_STYLES: Record<
  string,
  { dot: string; badge: string; accentLine: string }
> = {
  "Digital Literacy": {
    dot: "bg-sky-500",
    badge: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    accentLine: "bg-sky-500",
  },
  "Career Readiness": {
    dot: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    accentLine: "bg-amber-500",
  },
  "Life Skills": {
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    accentLine: "bg-emerald-500",
  },
  "Cultural Identity": {
    dot: "bg-violet-500",
    badge: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    accentLine: "bg-violet-500",
  },
};

const PILLAR_ORDER = [
  "Digital Literacy",
  "Career Readiness",
  "Life Skills",
  "Cultural Identity",
] as const;

const CATEGORY_ORDER: CourseCategory[] = ["Word", "Excel", "Slides", "Other"];

const FALLBACK_PILLAR_STYLE = {
  dot: "bg-slate-500",
  badge: "bg-muted text-muted-foreground",
  accentLine: "bg-slate-400",
} as const;

function sortCourses(a: CourseRow, b: CourseRow): number {
  const ca = CATEGORY_ORDER.indexOf(a.category);
  const cb = CATEGORY_ORDER.indexOf(b.category);
  if (ca !== cb) return ca - cb;
  return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
}

function groupCoursesByCategory(courses: CourseRow[]): Map<CourseCategory, CourseRow[]> {
  const map = new Map<CourseCategory, CourseRow[]>();
  for (const cat of CATEGORY_ORDER) map.set(cat, []);
  for (const c of courses) {
    const cat = c.category ?? "Other";
    const bucket = map.get(cat) ?? map.get("Other")!;
    bucket.push(c);
  }
  for (const list of map.values()) list.sort(sortCourses);
  return map;
}

export function AdminCourseGrid({ courses }: { courses: CourseRow[] }) {
  const [search, setSearch] = useState("");
  const [pillarFilter, setPillarFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<CourseCategory | "all">("all");

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      if (pillarFilter !== "all" && c.pillar !== pillarFilter) return false;
      if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
      if (search && !c.title.toLowerCase().includes(search.toLowerCase().trim())) return false;
      return true;
    });
  }, [courses, pillarFilter, categoryFilter, search]);

  const byPillar = useMemo(() => {
    const map = new Map<string, CourseRow[]>();
    for (const slug of PILLAR_ORDER) map.set(slug, []);
    for (const c of filtered) {
      const list = map.get(c.pillar);
      if (list) list.push(c);
      else map.set(c.pillar, [c]);
    }
    for (const list of map.values()) list.sort(sortCourses);
    return map;
  }, [filtered]);

  const pillarsToShow = useMemo(() => {
    if (pillarFilter !== "all") return [pillarFilter];
    const known = new Set<string>(PILLAR_ORDER);
    const extras = [
      ...new Set(filtered.map((c) => c.pillar).filter((p) => !known.has(p))),
    ];
    return [...PILLAR_ORDER, ...extras];
  }, [pillarFilter, filtered]);

  const totalVisible = filtered.length;

  const pillarBlocks = useMemo(() => {
    return pillarsToShow
      .map((pillar) => {
        const list = byPillar.get(pillar) ?? [];
        if (list.length === 0) return null;
        return { pillar, list };
      })
      .filter((b): b is { pillar: string; list: CourseRow[] } => b !== null);
  }, [pillarsToShow, byPillar]);

  return (
    <div className="space-y-6">
      {/* Filters — grouped card */}
      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Filter className="h-4 w-4 text-muted-foreground" />
          Find courses
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1 space-y-1.5">
            <label htmlFor="course-search" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Search by title
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="course-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to filter…"
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="grid w-full gap-4 sm:grid-cols-2 lg:w-auto lg:min-w-[200px] lg:flex-initial">
            <div className="space-y-1.5">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Pillar
              </span>
              <select
                value={pillarFilter}
                onChange={(e) => setPillarFilter(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All pillars</option>
                {PILLAR_ORDER.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Category
              </span>
              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value as CourseCategory | "all")
                }
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All categories</option>
                {CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-semibold tabular-nums text-foreground">{totalVisible}</span>
          {totalVisible === courses.length
            ? " courses"
            : ` of ${courses.length} courses`}
          . Results are grouped by pillar below.
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/50 bg-muted/10 py-16 text-center">
          <BookOpen className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="font-semibold text-foreground">No courses match</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {search || pillarFilter !== "all" || categoryFilter !== "all"
              ? "Try clearing filters or changing your search."
              : "Create your first course to get started."}
          </p>
        </div>
      ) : (
        <div>
          {pillarBlocks.map(({ pillar, list }, idx) => {
              const style = PILLAR_STYLES[pillar] ?? FALLBACK_PILLAR_STYLE;
              const byCategory = groupCoursesByCategory(list);
              const nonEmptyCategories = CATEGORY_ORDER.filter(
                (cat) => (byCategory.get(cat)?.length ?? 0) > 0
              );
              const showCategoryHeadings = nonEmptyCategories.length > 1;

              return (
                <section key={pillar}>
                  {idx > 0 ? (
                    <div
                      className="my-12 w-full border-t border-border/70"
                      aria-hidden
                    />
                  ) : null}

                  <header className="mb-6 flex flex-wrap items-end gap-x-3 gap-y-1">
                    <span
                      className={cn(
                        "inline-block h-2 w-2 shrink-0 rounded-full",
                        style.dot
                      )}
                      aria-hidden
                    />
                    <h2 className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
                      {pillar}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      · {list.length} course{list.length !== 1 ? "s" : ""}
                    </span>
                  </header>

                  <div className="space-y-8">
                    {showCategoryHeadings
                      ? nonEmptyCategories.map((cat) => {
                          const catCourses = byCategory.get(cat)!;
                          return (
                            <div key={cat} className="space-y-4">
                              <div className="flex items-center gap-3">
                                <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                  {cat}
                                </span>
                                <div className="h-px min-w-8 flex-1 bg-linear-to-r from-border/80 to-transparent" />
                                <span className="shrink-0 text-xs tabular-nums text-muted-foreground/80">
                                  {catCourses.length}
                                </span>
                              </div>
                              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                {catCourses.map((course) => (
                                  <CourseCard key={course.id} course={course} />
                                ))}
                              </div>
                            </div>
                          );
                        })
                      : (
                          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {list.map((course) => (
                              <CourseCard key={course.id} course={course} />
                            ))}
                          </div>
                        )}
                  </div>
                </section>
              );
            })}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: CourseRow }) {
  const style = PILLAR_STYLES[course.pillar] ?? FALLBACK_PILLAR_STYLE;
  const [isDeleting, startDelete] = useTransition();

  function handleDelete() {
    if (
      !confirm(
        `Delete "${course.title}"? This will also delete all its lessons. This cannot be undone.`
      )
    )
      return;
    const fd = new FormData();
    fd.set("course_id", course.id);
    startDelete(async () => {
      const res = await deleteCourse(fd);
      if (res.error) toast.error(res.error);
      else toast.success("Course deleted");
    });
  }

  return (
    <div
      className={cn(
        "group relative flex overflow-hidden rounded-2xl bg-linear-to-br from-card to-card/40 shadow-ambient ring-1 ring-border/35 transition-[box-shadow,ring-color] duration-200",
        "hover:ring-border/55 hover:shadow-md"
      )}
    >
      <div
        className={cn("w-1 shrink-0 self-stretch rounded-l-2xl", style.accentLine)}
        aria-hidden
      />
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 font-display text-[0.9375rem] font-semibold leading-snug tracking-tight text-foreground line-clamp-2 sm:text-base">
            {course.title}
          </h3>
          <span
            className={cn(
              "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold leading-none",
              style.badge
            )}
          >
            {course.category}
          </span>
        </div>

        {course.description ? (
          <p className="text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
            {course.description}
          </p>
        ) : (
          <p className="text-[13px] italic text-muted-foreground/45">No description yet</p>
        )}

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg bg-muted/60 px-2 py-1 text-[11px] font-medium text-muted-foreground">
            <BookOpen className="h-3 w-3 opacity-70" />
            {course.lessonCount} lesson{course.lessonCount !== 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-muted/60 px-2 py-1 text-[11px] font-medium text-muted-foreground">
            <Users className="h-3 w-3 opacity-70" />
            {course.studentCount} student{course.studentCount !== 1 ? "s" : ""}
          </span>
          {course.pendingCount > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/12 px-2 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              <ClipboardCheck className="h-3 w-3" />
              {course.pendingCount} pending
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-1">
          <Link
            href={`/dashboard/admin/courses/${course.id}`}
            className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary/12 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-[#f0f7f5]"
          >
            Open Builder
            <ChevronRight className="h-3.5 w-3.5 opacity-80" />
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete course"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive/8 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
