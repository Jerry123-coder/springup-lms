import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Circle } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingLink } from "@/components/ui/loading-link";
import type { Course, CoursePillar, Lesson } from "@/lib/types/database";

const pillarOrder: CoursePillar[] = [
  "Digital Literacy",
  "Career Readiness",
  "Life Skills",
  "Cultural Identity",
];

export async function StudentProgressTracker() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: coursesData } = await supabase
    .from("courses")
    .select("*")
    .order("title", { ascending: true });

  const courses = (coursesData ?? []) as Course[];

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-muted/40 px-6 py-16 text-center">
        <BookOpen className="mb-3 h-10 w-10 text-muted-foreground" />
        <h3 className="font-display text-lg font-semibold">No courses yet</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          When your programme adds courses, your completion and next steps will show
          here.
        </p>
      </div>
    );
  }

  const { data: lessonsData } = await supabase
    .from("lessons")
    .select("id, course_id, title, order_index")
    .order("order_index", { ascending: true });

  const allLessons = (lessonsData ?? []) as Pick<
    Lesson,
    "id" | "course_id" | "title" | "order_index"
  >[];

  const lessonIds = allLessons.map((l) => l.id);
  const lessonsByCourse = new Map<string, typeof allLessons>();
  for (const l of allLessons) {
    const list = lessonsByCourse.get(l.course_id) ?? [];
    list.push(l);
    lessonsByCourse.set(l.course_id, list);
  }

  let submittedLessonIds = new Set<string>();
  if (lessonIds.length > 0) {
    const { data: subs } = await supabase
      .from("submissions")
      .select("lesson_id")
      .eq("student_id", user.id)
      .in("lesson_id", lessonIds);
    submittedLessonIds = new Set(
      (subs ?? []).map((s) => (s as { lesson_id: string }).lesson_id)
    );
  }

  let videoWatchedByLesson = new Map<string, boolean>();
  if (lessonIds.length > 0) {
    const { data: lp } = await supabase
      .from("lesson_progress")
      .select("lesson_id, video_watched_at")
      .eq("student_id", user.id)
      .in("lesson_id", lessonIds);
    videoWatchedByLesson = new Map(
      (lp ?? []).map((r) => {
        const row = r as { lesson_id: string; video_watched_at: string | null };
        return [row.lesson_id, !!row.video_watched_at];
      })
    );
  }

  type Row = {
    course: Course;
    total: number;
    submitted: number;
    videoReady: number;
    pct: number;
    nextLesson: (typeof allLessons)[0] | null;
  };

  const rows: Row[] = [];

  let sumPct = 0;
  let coursesWithLessons = 0;
  let totalLessonsAll = 0;
  let submittedLessonsAll = 0;

  for (const course of courses) {
    const list = lessonsByCourse.get(course.id) ?? [];
    const total = list.length;
    if (total === 0) continue;
    coursesWithLessons += 1;
    totalLessonsAll += total;
    let submitted = 0;
    let videoReady = 0;
    for (const l of list) {
      if (submittedLessonIds.has(l.id)) submitted += 1;
      if (videoWatchedByLesson.get(l.id)) videoReady += 1;
    }
    submittedLessonsAll += submitted;
    const pct = Math.round((submitted / total) * 100);
    sumPct += pct;
    const nextLesson =
      list.find((l) => !submittedLessonIds.has(l.id)) ?? null;
    rows.push({ course, total, submitted, videoReady, pct, nextLesson });
  }

  if (rows.length === 0 && courses.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-muted/40 px-6 py-16 text-center">
        <BookOpen className="mb-3 h-10 w-10 text-muted-foreground" />
        <h3 className="font-display text-lg font-semibold">Lessons coming soon</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Courses are listed, but lessons haven&apos;t been published yet. Check back
          after your instructors add content.
        </p>
      </div>
    );
  }

  const overallPct =
    coursesWithLessons > 0 ? Math.round(sumPct / coursesWithLessons) : 0;
  const coursesStarted = rows.filter((r) => r.submitted > 0 || r.videoReady > 0).length;

  const byPillar = new Map<CoursePillar, Row[]>();
  for (const p of pillarOrder) byPillar.set(p, []);
  for (const r of rows) {
    byPillar.get(r.course.pillar)?.push(r);
  }

  return (
    <div className="space-y-12">
      <section className="rounded-[1.75rem] bg-muted/50 p-6 shadow-ambient sm:p-8">
        <p className="font-display text-sm font-medium text-muted-foreground">Summary</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl bg-card p-5 shadow-ambient">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Overall completion
          </p>
          <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-foreground">
            {coursesWithLessons > 0 ? `${overallPct}%` : "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Average across courses with lessons
          </p>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-ambient">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Lessons with submission
          </p>
          <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-foreground">
            {submittedLessonsAll}
            <span className="text-lg font-normal text-muted-foreground">
              {" "}
              / {totalLessonsAll}
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Submitted work counts toward completion
          </p>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-ambient">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Courses in motion
          </p>
          <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-foreground">
            {coursesStarted}
            <span className="text-lg font-normal text-muted-foreground">
              {" "}
              / {rows.length}
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            With activity or submissions
          </p>
        </div>
        </div>
      </section>

      <div className="space-y-10">
        {pillarOrder.map((pillar) => {
          const list = byPillar.get(pillar) ?? [];
          if (list.length === 0) return null;
          return (
            <section key={pillar}>
              <h3 className="font-display text-base font-semibold">{pillar}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {list.length} course(s)
              </p>
              <ul className="mt-4 space-y-4">
                {list.map((r) => (
                  <li
                    key={r.course.id}
                    className="rounded-2xl bg-card p-5 shadow-ambient sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-display font-medium text-foreground">
                            {r.course.title}
                          </h4>
                          <Badge variant="secondary" className="text-xs font-normal">
                            {r.submitted}/{r.total} lessons
                          </Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {r.course.description}
                        </p>
                        <div className="mt-4">
                          <div
                            className="h-2.5 overflow-hidden rounded-full bg-muted"
                            role="progressbar"
                            aria-valuenow={r.pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${r.course.title} progress`}
                          >
                            <div
                              className="h-full rounded-full bg-gradient-primary transition-[width]"
                              style={{ width: `${r.pct}%` }}
                            />
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>
                              Submission progress:{" "}
                              <span className="font-medium text-foreground">
                                {r.pct}%
                              </span>
                            </span>
                            <span className="hidden sm:inline">·</span>
                            <span>
                              Videos marked watched:{" "}
                              <span className="font-medium text-foreground">
                                {r.videoReady}/{r.total}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                        {r.nextLesson ? (
                          <LoadingLink
                            href={`/dashboard/student/courses/${r.course.id}/lessons/${r.nextLesson.id}`}
                            variant="secondary"
                            className="gap-2 rounded-2xl"
                          >
                            Next: {r.nextLesson.title}
                            <ArrowRight className="h-4 w-4" />
                          </LoadingLink>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                            <CheckCircle2 className="h-4 w-4" />
                            Course complete
                          </span>
                        )}
                        <LoadingLink
                          href={`/dashboard/student/courses/${r.course.id}`}
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                        >
                          Open course
                        </LoadingLink>
                      </div>
                    </div>

                    <details className="group mt-8 rounded-2xl bg-muted/40 p-4">
                      <summary className="cursor-pointer list-none text-xs font-medium text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
                        <span className="inline-flex items-center gap-1">
                          Lesson checklist
                          <span className="text-muted-foreground/80 group-open:rotate-90 transition-transform">
                            →
                          </span>
                        </span>
                      </summary>
                      <ol className="mt-4 space-y-3 pl-1">
                        {(lessonsByCourse.get(r.course.id) ?? []).map((lesson) => {
                          const done = submittedLessonIds.has(lesson.id);
                          const vid = videoWatchedByLesson.get(lesson.id);
                          return (
                            <li
                              key={lesson.id}
                              className="flex flex-wrap items-center gap-2 text-sm"
                            >
                              {done ? (
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                              ) : (
                                <Circle className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                              )}
                              <span
                                className={
                                  done ? "text-foreground" : "text-muted-foreground"
                                }
                              >
                                {lesson.title}
                              </span>
                              {vid ? (
                                <span className="text-xs text-muted-foreground">
                                  (video viewed)
                                </span>
                              ) : null}
                            </li>
                          );
                        })}
                      </ol>
                    </details>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
