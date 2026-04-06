"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  Loader2,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { deleteCourse } from "@/lib/actions/admin";
import type { CourseRow } from "@/app/dashboard/admin/courses/page";

const PILLAR_STYLES: Record<string, { dot: string; badge: string }> = {
  "Digital Literacy":  { dot: "bg-sky-500",     badge: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  "Career Readiness":  { dot: "bg-amber-500",   badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  "Life Skills":       { dot: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  "Cultural Identity": { dot: "bg-violet-500",  badge: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
};
const PILLAR_SLUGS = ["Digital Literacy", "Career Readiness", "Life Skills", "Cultural Identity"] as const;

export function AdminCourseGrid({ courses }: { courses: CourseRow[] }) {
  const [search, setSearch]         = useState("");
  const [pillarFilter, setPillarFilter] = useState<string>("all");

  const filtered = courses.filter((c) => {
    if (pillarFilter !== "all" && c.pillar !== pillarFilter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses…"
            className="w-full rounded-xl border border-input bg-card py-2 pl-8 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", ...PILLAR_SLUGS] as const).map((slug) => {
            const style = slug !== "all" ? PILLAR_STYLES[slug] : null;
            const isActive = pillarFilter === slug;
            return (
              <button
                key={slug}
                type="button"
                onClick={() => setPillarFilter(slug)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-foreground text-background"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                {style && <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />}
                {slug === "all" ? "All Pillars" : slug}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/50 bg-muted/10 py-16 text-center">
          <BookOpen className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="font-semibold text-foreground">No courses found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search ? "Try a different search term." : "Create your first course to get started."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: CourseRow }) {
  const style = PILLAR_STYLES[course.pillar] ?? PILLAR_STYLES["Digital Literacy"];
  const [isDeleting, startDelete] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete "${course.title}"? This will also delete all its lessons. This cannot be undone.`)) return;
    const fd = new FormData();
    fd.set("course_id", course.id);
    startDelete(async () => {
      const res = await deleteCourse(fd);
      if (res.error) toast.error(res.error);
      else toast.success("Course deleted");
    });
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-card shadow-ambient transition-shadow hover:shadow-lg">
      {/* Colour accent top bar */}
      <div className={`h-1 w-full ${style.dot}`} />

      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex-1 text-sm font-bold leading-snug text-foreground line-clamp-2">
            {course.title}
          </h3>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.badge}`}>
            {course.category}
          </span>
        </div>

        {/* Pillar */}
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          <span className="text-xs font-medium text-muted-foreground">{course.pillar}</span>
        </div>

        {/* Description */}
        {course.description ? (
          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">{course.description}</p>
        ) : (
          <p className="text-xs italic text-muted-foreground/50">No description</p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 border-t pt-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{course.lessonCount} lesson{course.lessonCount !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{course.studentCount} student{course.studentCount !== 1 ? "s" : ""}</span>
          </div>
          {course.pendingCount > 0 && (
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <ClipboardCheck className="h-3.5 w-3.5" />
              <span>{course.pendingCount} pending</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            href={`/dashboard/admin/courses/${course.id}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-[#f0f7f5]"
          >
            Open Builder
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete course"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
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
