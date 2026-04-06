import Link from "next/link";
import { Award, GraduationCap } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CourseRow = { id: string; title: string; pillar: string; category: string };
type BlockCourseRow = { course_id: string };
type LessonRow = { id: string; course_id: string };
type SubmissionRow = { lesson_id: string };
type CertificateRow = {
  course_id: string;
  certificate_number: string;
  issued_at: string;
  file_url: string | null;
  issued_by: string | null;
};

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
    new Set(
      ((blockCourses ?? []) as BlockCourseRow[])
        .map((bc) => bc.course_id)
        .filter(Boolean)
    )
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

  const submittedLessonIds = new Set(
    ((submissions ?? []) as SubmissionRow[]).map((s) => s.lesson_id)
  );

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
  for (const r of (certRows ?? []) as CertificateRow[]) {
    certByCourseId.set(r.course_id, {
      certificate_number: r.certificate_number,
      issued_at: r.issued_at,
      file_url: r.file_url ?? null,
    });
  }

  const completed = courseProgress.filter((p) => p.isComplete);

  return (
    <>
      <DashboardHeader heading="Certificates" />
      <div className="mx-auto w-full max-w-6xl flex-1 space-y-8 p-6">
        <div className="rounded-[1.75rem] bg-muted/50 p-6 shadow-ambient sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card text-primary shadow-sm">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold md:text-xl">
                    Learning path progress
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Lessons completed across your recommended programme.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-6">
              <div className="text-center sm:text-right">
                <p className="font-display text-2xl font-semibold tabular-nums">
                  {totalPercent}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {totalDone}/{totalLessons} lessons
                </p>
              </div>
              <div className="h-2 w-full max-w-[240px] overflow-hidden rounded-full bg-muted sm:w-44">
                <div
                  className="h-full rounded-full bg-gradient-primary"
                  style={{ width: `${totalPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-muted/40 p-6 shadow-ambient sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold">Certificates</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Issued when you finish every lesson in a path course.
              </p>
            </div>
            <Badge variant={completed.length > 0 ? "default" : "secondary"}>
              {completed.length} completed
            </Badge>
          </div>

          {learningCourses.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-card/90 py-12 text-center text-sm text-muted-foreground shadow-ambient">
              No learning path found yet.
            </div>
          ) : (
            <ul className="mt-8 space-y-5">
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
                  <li
                    key={p.course.id}
                    className="rounded-2xl bg-card p-5 shadow-ambient sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-medium leading-snug">{p.course.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full bg-accent px-2.5 py-0.5 font-medium text-accent-foreground">
                          {p.course.pillar}
                        </span>
                        <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium">
                          {p.course.category}
                        </span>
                        <span>
                          {p.done}/{p.total} lessons ({p.percent}%)
                        </span>
                      </div>
                      {p.isComplete && !cert?.file_url && (
                        <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
                          Course complete—your certificate will appear when your coach
                          issues it.
                        </p>
                      )}
                      {cert?.file_url && cert.certificate_number ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          #{cert.certificate_number}
                          {issued ? ` · ${issued}` : ""}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-0 sm:justify-end">
                      {p.isComplete ? (
                        <Badge className="gap-1" variant="default">
                          <Award className="h-3.5 w-3.5" /> Done
                        </Badge>
                      ) : (
                        <Badge variant="secondary">In progress</Badge>
                      )}

                      {cert?.file_url ? (
                        <Button asChild className="rounded-xl">
                          <Link href={cert.file_url} target="_blank" rel="noreferrer">
                            Download
                          </Link>
                        </Button>
                      ) : p.isComplete ? (
                        <Button disabled variant="secondary" className="rounded-xl">
                          Awaiting issue
                        </Button>
                      ) : (
                        <Button disabled variant="secondary" className="rounded-xl">
                          Locked
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

