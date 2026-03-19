import { Suspense } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  LessonSidebarSkeleton,
  LessonContentSkeleton,
} from "@/components/dashboard/classroom-skeleton";
import { CourseClassroom } from "@/components/dashboard/course-classroom";
import type { Lesson } from "@/lib/types/database";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

async function RedirectToFirstLesson({ courseId }: { courseId: string }) {
  const supabase = await createClient();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  const lessonList = (lessons ?? []) as Lesson[];
  const first = lessonList[0];
  if (first) {
    redirect(`/dashboard/student/courses/${courseId}/lessons/${first.id}`);
  }

  // No lessons: stay on the course page and show empty state in classroom.
  return <CourseClassroom courseId={courseId} />;
}

export default async function CourseDetailPage({
  params,
}: PageProps) {
  const { courseId } = await params;

  return (
    <div className="h-svh overflow-hidden">
      <Suspense
        fallback={
          <div className="flex h-full w-full flex-col gap-4 md:flex-row md:gap-0">
            <aside className="w-full rounded-xl border bg-muted/30 p-4 md:w-72 md:border-b-0 md:p-3">
              <LessonSidebarSkeleton />
            </aside>
            <div className="flex-1 overflow-y-auto p-6">
              <LessonContentSkeleton />
            </div>
          </div>
        }
      >
        <RedirectToFirstLesson courseId={courseId} />
      </Suspense>
    </div>
  );
}
