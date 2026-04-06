import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, GraduationCap, Layers } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CourseEditor } from "@/components/dashboard/course-editor";

interface PageProps {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ tab?: string }>;
}

const PILLAR_BADGE: Record<string, string> = {
  "Digital Literacy":  "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "Career Readiness":  "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "Life Skills":       "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "Cultural Identity": "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

export default async function CourseDetailPage({ params, searchParams }: PageProps) {
  const { courseId }  = await params;
  const { tab }       = await searchParams;
  const supabase      = await createClient();

  // Fetch course
  const { data: courseData } = await supabase
    .from("courses")
    .select("id, title, pillar, category, description")
    .eq("id", courseId)
    .maybeSingle();

  if (!courseData) notFound();

  type Course = { id: string; title: string; pillar: string; category: string; description: string };
  const course = courseData as Course;

  // Fetch lessons ordered
  const { data: lessonsData } = await supabase
    .from("lessons")
    .select("id, title, content, order_index")
    .eq("course_id", courseId)
    .order("order_index");

  type Lesson = { id: string; title: string; content: string; order_index: number };
  const lessons = (lessonsData ?? []) as Lesson[];

  // Student engagement stats
  const { data: subsData } = await supabase
    .from("submissions")
    .select("student_id, lesson_id, grade, status")
    .in("lesson_id", lessons.map((l) => l.id));

  type SubRow = { student_id: string; lesson_id: string; grade: number | null; status: string };
  const subs = (subsData ?? []) as SubRow[];

  const uniqueStudents  = new Set(subs.map((s) => s.student_id)).size;
  const reviewedSubs    = subs.filter((s) => s.status === "reviewed" && s.grade !== null);
  const avgGrade        = reviewedSubs.length > 0
    ? Math.round(reviewedSubs.reduce((n, s) => n + (s.grade ?? 0), 0) / reviewedSubs.length)
    : null;
  const pendingCount    = subs.filter((s) => s.status === "pending").length;

  const badgeClass = PILLAR_BADGE[course.pillar] ?? "bg-muted text-foreground";

  return (
    <>
      <DashboardHeader heading={course.title} />
      <div className="mx-auto w-full max-w-5xl flex-1 space-y-6 p-6">

        {/* Back */}
        <Link
          href="/dashboard/instructor/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Courses
        </Link>

        {/* Course header card */}
        <div className="rounded-[1.75rem] bg-card p-6 shadow-ambient">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 min-w-0">
              <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${badgeClass}`}>
                {course.pillar}
              </span>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
                {course.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {course.description || "No description added yet."}
              </p>
            </div>
          </div>

          {/* Stat pills */}
          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { icon: Layers,        value: lessons.length,    label: `lesson${lessons.length !== 1 ? "s" : ""}` },
              { icon: GraduationCap, value: uniqueStudents,    label: `student${uniqueStudents !== 1 ? "s" : ""}` },
              { icon: BookOpen,      value: avgGrade !== null ? `${avgGrade}%` : "—", label: "avg grade" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2 rounded-xl bg-muted/60 px-3.5 py-2">
                <Icon className="h-3.5 w-3.5 text-primary/70" />
                <span className="text-sm font-bold text-foreground">{value}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
            {pendingCount > 0 && (
              <Link
                href={`/dashboard/instructor/grading`}
                className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-500/20"
              >
                {pendingCount} pending review{pendingCount !== 1 ? "s" : ""}
              </Link>
            )}
          </div>
        </div>

        {/* Curriculum editor */}
        <CourseEditor
          course={course}
          lessons={lessons}
          defaultTab={tab === "add" ? "add" : "curriculum"}
        />
      </div>
    </>
  );
}
