import { Suspense } from "react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  LessonContentSkeleton,
  LessonSidebarSkeleton,
} from "@/components/dashboard/classroom-skeleton";
import { CourseClassroom } from "@/components/dashboard/course-classroom";

interface PageProps {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function LessonPage({ params }: PageProps) {
  const { courseId, lessonId } = await params;

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <div className="shrink-0 md:hidden">
        <DashboardHeader heading="Course" />
      </div>
      <Suspense
        fallback={
          <div className="flex flex-1 flex-col gap-4 overflow-hidden md:flex-row md:gap-0">
            <aside className="w-full rounded-xl border bg-muted/30 p-4 md:w-72 md:border-b-0 md:p-3">
              <LessonSidebarSkeleton />
            </aside>
            <div className="flex-1 overflow-y-auto p-6">
              <LessonContentSkeleton />
            </div>
          </div>
        }
      >
        <CourseClassroom courseId={courseId} lessonId={lessonId} />
      </Suspense>
    </div>
  );
}

