import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, ClipboardCheck, Users } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AdminCourseBuilder } from "@/components/dashboard/admin-course-builder";
import type { Course, Lesson, LessonMaterial } from "@/lib/types/database";

type SubRow  = { student_id: string; lesson_id: string; status: string };

export default async function AdminCourseBuilderPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();

  type LooseQ = { data: unknown; error: unknown };
  const loose = <T,>(p: T) => p as unknown as Promise<LooseQ>;

  const [courseRes, lessonsRes, subsRes] = await Promise.all([
    loose(supabase.from("courses").select("*").eq("id", courseId).single()),
    loose(supabase.from("lessons").select("*").eq("course_id", courseId).order("order_index", { ascending: true })),
    loose(supabase.from("submissions" as never).select("student_id, lesson_id, status")),
  ]);

  if (courseRes.error || !courseRes.data) notFound();

  const course  = courseRes.data as Course;
  const lessons = ((lessonsRes.data ?? []) as unknown[]) as Lesson[];
  const subs    = ((subsRes.data ?? []) as unknown[]) as SubRow[];

  const lessonIdList = lessons.map((l) => l.id);
  const materialsByLessonId: Record<string, LessonMaterial[]> = {};
  if (lessonIdList.length > 0) {
    const matsRes = await loose(
      supabase.from("lesson_materials" as never).select("*").in("lesson_id", lessonIdList)
    );
    const mats = ((matsRes.data ?? []) as unknown[]) as LessonMaterial[];
    for (const m of mats) {
      if (!materialsByLessonId[m.lesson_id]) materialsByLessonId[m.lesson_id] = [];
      materialsByLessonId[m.lesson_id].push(m);
    }
    for (const id of Object.keys(materialsByLessonId)) {
      materialsByLessonId[id].sort((a, b) => a.order_index - b.order_index);
    }
  }

  // Filter to only this course's lessons
  const lessonIdSet = new Set(lessonIdList);
  const courseSubs = subs.filter((s) => lessonIdSet.has(s.lesson_id));

  const studentCount = new Set(courseSubs.map((s) => s.student_id)).size;
  const pendingCount = courseSubs.filter((s) => s.status === "pending").length;
  const reviewedCount = courseSubs.filter((s) => s.status === "reviewed").length;

  return (
    <>
      <DashboardHeader heading={course.title} />
      <div className="flex-1 space-y-6 p-6">
        {/* Breadcrumb */}
        <Link
          href="/dashboard/admin/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Course Management
        </Link>
        {/* Course stats bar */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Lessons",          value: lessons.length,  icon: BookOpen },
            { label: "Students",         value: studentCount,    icon: Users },
            { label: "Pending Reviews",  value: pendingCount,    icon: ClipboardCheck },
            { label: "Reviewed",         value: reviewedCount,   icon: ClipboardCheck },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl bg-card p-4 shadow-ambient">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
              </div>
              <p className="mt-1.5 font-display text-2xl font-bold tabular-nums text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* Builder */}
        <AdminCourseBuilder
          course={course}
          lessons={lessons}
          materialsByLessonId={materialsByLessonId}
        />
      </div>
    </>
  );
}
