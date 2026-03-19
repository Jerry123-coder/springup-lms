import Link from "next/link";
import { Award, GraduationCap } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CourseRow = { id: string; title: string; pillar: string; category: string };
type LessonRow = { id: string; course_id: string };

function pct(done: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}

export default async function StudentCertificatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Pull the learning-path courses (same source as the classroom page).
  const [{ data: blockCourses }, { data: courses }] = await Promise.all([
    supabase.from("learning_block_courses").select("course_id").order("order_index", { ascending: true }),
    supabase.from("courses").select("id, title, pillar, category").order("created_at", { ascending: true }),
  ]);

  const courseById = new Map<string, CourseRow>();
  for (const c of (courses ?? []) as CourseRow[]) courseById.set(c.id, c);

  const learningCourseIds = Array.from(
    new Set((blockCourses ?? []).map((bc) => bc.course_id).filter(Boolean))
  ) as string[];

  const learningCourses = learningCourseIds
    .map((id) => courseById.get(id))
    .filter(Boolean) as CourseRow[];

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, course_id")
    .in("course_id", learningCourseIds.length ? learningCourseIds : ["00000000-0000-0000-0000-000000000000"]);

  const lessonRows = (lessons ?? []) as LessonRow[];
  const lessonIds = lessonRows.map((l) => l.id);

  const { data: submissions } = await supabase
    .from("submissions")
    .select("lesson_id")
    .eq("student_id", user.id)
    .in("lesson_id", lessonIds.length ? lessonIds : ["00000000-0000-0000-0000-000000000000"]);

  const submittedLessonIds = new Set((submissions ?? []).map((s) => s.lesson_id));

  const lessonsByCourse = new Map<string, string[]>();
  for (const l of lessonRows) {
    const arr = lessonsByCourse.get(l.course_id) ?? [];
    arr.push(l.id);
    lessonsByCourse.set(l.course_id, arr);
  }

  const courseProgress = learningCourses.map((c) => {
    const ids = lessonsByCourse.get(c.id) ?? [];
    const done = ids.reduce((acc, id) => acc + (submittedLessonIds.has(id) ? 1 : 0), 0);
    const total = ids.length;
    return {
      course: c,
      done,
      total,
      percent: pct(done, total),
      isComplete: total > 0 && done === total,
    };
  });

  const totalLessons = courseProgress.reduce((acc, p) => acc + p.total, 0);
  const totalDone = courseProgress.reduce((acc, p) => acc + p.done, 0);
  const totalPercent = pct(totalDone, totalLessons);

  const completedCourseIds = courseProgress.filter((p) => p.isComplete).map((p) => p.course.id);
  const { data: certRows } = await supabase
    .from("certificates")
    .select("course_id, certificate_number, issued_at, file_url, issued_by")
    .eq("student_id", user.id)
    .in("course_id", completedCourseIds.length ? completedCourseIds : ["00000000-0000-0000-0000-000000000000"]);

  const certByCourseId = new Map<
    string,
    { certificate_number: string; issued_at: string; file_url: string | null }
  >();
  for (const r of certRows ?? []) {
    certByCourseId.set(r.course_id, {
      certificate_number: r.certificate_number,
      issued_at: r.issued_at,
      file_url: r.file_url ?? null,
    });
  }

  const completed = courseProgress.filter((p) => p.isComplete);

  return (
    <>
      <DashboardHeader heading="Certificates & Progress" />
      <div className="flex-1 space-y-6 p-6">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-sky-500" />
                <h2 className="text-lg font-semibold">Your overall learning progress</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Based on lessons you’ve completed in the recommended learning path.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold">{totalPercent}%</p>
                <p className="text-xs text-muted-foreground">
                  {totalDone}/{totalLessons} lessons
                </p>
              </div>
              <div className="h-2 w-44 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-linear-to-r from-sky-400 to-emerald-400"
                  style={{ width: `${totalPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card">
          <div className="border-b px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">Course certificates</h3>
                <p className="text-sm text-muted-foreground">
                  Certificates appear when you complete every lesson in a course.
                </p>
              </div>
              <Badge variant={completed.length > 0 ? "default" : "secondary"}>
                {completed.length} completed
              </Badge>
            </div>
          </div>

          {learningCourses.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No learning path found yet.
            </div>
          ) : (
            <div className="divide-y">
              {courseProgress.map((p) => {
                const cert = certByCourseId.get(p.course.id);
                const issued =
                  cert?.issued_at
                    ? new Date(cert.issued_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : null;

                return (
                  <div key={p.course.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{p.course.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded-md border px-2 py-0.5">{p.course.pillar}</span>
                        <span className="rounded-md border px-2 py-0.5">{p.course.category}</span>
                        <span>
                          Progress: <span className="font-semibold text-foreground">{p.done}/{p.total}</span> ({p.percent}%)
                        </span>
                      </div>
                      {p.isComplete && !cert?.file_url && (
                        <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">
                          You’ve finished this course. Your official certificate will appear here once your coach issues it.
                        </p>
                      )}
                      {cert?.file_url && cert.certificate_number ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Certificate #{cert.certificate_number}{issued ? ` • Issued ${issued}` : ""}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 sm:justify-end">
                      {p.isComplete ? (
                        <Badge className="gap-1" variant="default">
                          <Award className="h-3.5 w-3.5" /> Completed
                        </Badge>
                      ) : (
                        <Badge variant="secondary">In progress</Badge>
                      )}

                      {cert?.file_url ? (
                        <Button asChild>
                          <Link href={cert.file_url} target="_blank" rel="noreferrer">
                            Download official certificate
                          </Link>
                        </Button>
                      ) : p.isComplete ? (
                        <Button disabled>Awaiting official certificate</Button>
                      ) : (
                        <Button disabled>Complete course to unlock</Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

