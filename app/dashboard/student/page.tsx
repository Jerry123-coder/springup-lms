import { Suspense } from "react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StudentHubSkeleton } from "@/components/dashboard/classroom-skeleton";
import { StudentLearningHub } from "@/components/dashboard/student-learning-hub";
import { StudentDashboardCatalogPromo } from "@/components/dashboard/student-dashboard-catalog-promo";

export default function StudentMainDashboardPage() {
  return (
    <>
      <DashboardHeader heading="Home" />
      <div className="mx-auto w-full max-w-6xl flex-1 space-y-10 p-6 md:space-y-12">
        <Suspense fallback={<StudentHubSkeleton />}>
          <StudentLearningHub />
        </Suspense>
        <StudentDashboardCatalogPromo />
      </div>
    </>
  );
}
