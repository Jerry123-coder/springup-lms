import { Skeleton } from "@/components/ui/skeleton";

export function StudentHubSkeleton() {
  return (
    <div className="space-y-10 md:space-y-12">
      <div
        className="rounded-[1.75rem] px-6 py-11 sm:px-12 sm:py-14"
        style={{
          background:
            "linear-gradient(128deg, #001a16 0%, #00342b 40%, #0a6b5c 100%)",
        }}
      >
        <Skeleton className="h-3 w-32 bg-white/25" />
        <Skeleton className="mt-4 h-12 w-full max-w-md bg-white/20" />
        <Skeleton className="mt-3 h-10 w-full max-w-sm bg-white/15" />
        <Skeleton className="mt-6 h-4 w-full max-w-2xl bg-white/15" />
        <Skeleton className="mt-2 h-4 w-full max-w-xl bg-white/10" />
      </div>
      <div className="rounded-[1.75rem] bg-muted/50 p-6 sm:p-8 md:p-10">
        <Skeleton className="h-4 w-24" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-card p-6 shadow-ambient">
            <div className="flex justify-between gap-3">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-10 w-14" />
                <Skeleton className="h-3 w-36" />
              </div>
              <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
            </div>
          </div>
        ))}
        </div>
      </div>
      <div className="rounded-[1.75rem] bg-secondary/70 p-6 sm:p-8 md:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <Skeleton className="h-12 w-36 shrink-0 rounded-2xl" />
        </div>
        <Skeleton className="mt-8 h-24 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function CourseGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-[1.25rem] bg-card p-6 shadow-ambient">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-5 w-24 rounded-md" />
          </div>
          <Skeleton className="mt-4 h-5 w-3/4" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-1 h-4 w-2/3" />
          <Skeleton className="mt-4 h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

export function LessonSidebarSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full rounded-md" />
      ))}
    </div>
  );
}

export function LessonContentSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="mt-6 h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  );
}
