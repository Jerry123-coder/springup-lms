import { Suspense } from "react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CourseGridSkeleton } from "@/components/dashboard/classroom-skeleton";
import { StudentCourseCatalog } from "@/components/dashboard/student-course-catalog";

export default function StudentCourseCatalogPage() {
  return (
    <>
      <DashboardHeader heading="Explore Catalog" />
      <div className="mx-auto w-full max-w-7xl flex-1 space-y-8 p-6">
        <Suspense fallback={<CourseGridSkeleton />}>
          <StudentCourseCatalog />
        </Suspense>
      </div>
    </>
  );
}
