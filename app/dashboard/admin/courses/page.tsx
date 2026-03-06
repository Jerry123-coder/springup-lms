import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CourseManager } from "@/components/dashboard/course-manager";
import { Skeleton } from "@/components/ui/skeleton";
import type { Course, Lesson } from "@/lib/types/database";

async function CoursesList() {
  const supabase = await createClient();

  const { data: coursesData, error: cErr } = await supabase
    .from("courses")
    .select("*")
    .order("pillar", { ascending: true });

  if (cErr) {
    return (
      <p className="text-sm text-destructive">
        Error loading courses: {cErr.message}
      </p>
    );
  }

  const courses = (coursesData ?? []) as Course[];

  const { data: lessonsData } = await supabase
    .from("lessons")
    .select("*")
    .order("order_index", { ascending: true });

  const lessons = (lessonsData ?? []) as Lesson[];
  const lessonsByCourse = new Map<string, Lesson[]>();
  for (const l of lessons) {
    const existing = lessonsByCourse.get(l.course_id) ?? [];
    existing.push(l);
    lessonsByCourse.set(l.course_id, existing);
  }

  const coursesWithLessons = courses.map((c) => ({
    ...c,
    lessons: lessonsByCourse.get(c.id) ?? [],
  }));

  return <CourseManager courses={coursesWithLessons} />;
}

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminCoursesPage() {
  return (
    <>
      <DashboardHeader heading="Course Management" />
      <div className="flex-1 space-y-6 p-6">
        <Suspense fallback={<PageSkeleton />}>
          <CoursesList />
        </Suspense>
      </div>
    </>
  );
}
