"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Lesson } from "@/lib/types/database";

// Group lessons into modules — every 5 lessons becomes one module when the
// course has more than 5 lessons total.
function buildModules(
  lessons: Lesson[]
): { name: string; lessons: Lesson[] }[] {
  if (lessons.length <= 5) {
    return [{ name: "", lessons }];
  }
  const size = 5;
  const groups: { name: string; lessons: Lesson[] }[] = [];
  for (let i = 0; i < lessons.length; i += size) {
    groups.push({
      name: `Module ${Math.floor(i / size) + 1}`,
      lessons: lessons.slice(i, i + size),
    });
  }
  return groups;
}

export function LessonSidebarList({
  lessons,
  courseId,
  activeLessonId: activeLessonIdProp,
  progressPct,
  completedCount,
  totalCount,
  lessonStatus,
}: {
  lessons: Lesson[];
  courseId: string;
  /** When provided, overrides useParams() – use this when rendering server-side. */
  activeLessonId?: string | null;
  progressPct?: number;
  completedCount?: number;
  totalCount?: number;
  lessonStatus?: Record<string, { videoDone: boolean; hasSubmission: boolean }>;
}) {
  const params = useParams<{ lessonId?: string }>();
  const activeLessonId = activeLessonIdProp ?? params?.lessonId ?? null;

  const modules = buildModules(lessons);

  return (
    <div className="space-y-0.5">
      {/* Optional compact progress row */}
      {progressPct !== undefined && (
        <div className="mb-3 px-2">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider">Progress</span>
            <span className="font-bold text-foreground">
              {completedCount ?? 0}/{totalCount ?? lessons.length}
            </span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-primary transition-[width] duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {modules.map((mod) => (
        <div key={mod.name || "all"}>
          {/* Module header */}
          {mod.name && (
            <p className="mb-1 mt-3 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">
              {mod.name}
            </p>
          )}

          {mod.lessons.map((lesson) => {
            const isActive = activeLessonId === lesson.id;
            const status = lessonStatus?.[lesson.id];
            const isDone = !!status?.hasSubmission;
            const globalIdx = lessons.findIndex((l) => l.id === lesson.id);

            return (
              <Link
                key={lesson.id}
                href={`/dashboard/student/courses/${courseId}/lessons/${lesson.id}`}
                className={cn(
                  "group flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : isDone
                    ? "text-foreground hover:bg-muted/50"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
              >
                {/* Status circle */}
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isDone
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {isDone && !isActive ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    globalIdx + 1
                  )}
                </span>

                {/* Title */}
                <span className="min-w-0 flex-1 truncate text-xs font-medium leading-snug">
                  {lesson.title}
                </span>

                {/* Right indicator */}
                {isActive ? (
                  <span className="shrink-0 rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">
                    Now
                  </span>
                ) : isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                ) : (
                  <Circle className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                )}
              </Link>
            );
          })}
        </div>
      ))}

      {lessons.length === 0 && (
        <p className="px-2 py-4 text-center text-xs text-muted-foreground">
          No lessons added yet.
        </p>
      )}
    </div>
  );
}
