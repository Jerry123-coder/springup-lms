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
    <>
      <DashboardHeader heading="Course" />
      <Suspense
        fallback={
          <div className="flex flex-1 flex-col md:flex-row">
            <aside className="w-full border-b bg-muted/30 p-4 md:w-64 md:shrink-0 md:border-b-0 md:border-r">
              <LessonSidebarSkeleton />
            </aside>
            <div className="flex-1 p-6">
              <LessonContentSkeleton />
            </div>
          </div>
        }
      >
        <CourseClassroom courseId={courseId} lessonId={lessonId} />
      </Suspense>
    </>
  );
}

