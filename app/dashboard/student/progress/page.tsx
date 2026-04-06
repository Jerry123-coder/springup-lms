import { Suspense } from "react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StudentLearningRoadmap } from "@/components/dashboard/student-learning-roadmap";
import { Skeleton } from "@/components/ui/skeleton";

function RoadmapSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_288px]">
      <div className="space-y-6">
        <div className="rounded-[1.75rem] bg-muted/50 p-8 shadow-ambient">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-3 h-8 w-72" />
          <Skeleton className="mt-2 h-4 w-96 max-w-full" />
          <div className="mt-5 flex gap-5">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex-1 rounded-2xl bg-card p-5 shadow-ambient">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-2 h-5 w-48" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-4 h-2 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl bg-card p-5 shadow-ambient">
          <Skeleton className="h-5 w-36" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-ambient">
          <Skeleton className="h-5 w-36" />
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LearningPathPage() {
  return (
    <>
      <DashboardHeader heading="Learning Path" />
      <div className="mx-auto w-full max-w-7xl flex-1 space-y-2 p-6">
        <Suspense fallback={<RoadmapSkeleton />}>
          <StudentLearningRoadmap />
        </Suspense>
      </div>
    </>
  );
}
