import { Skeleton } from "@/components/ui/skeleton";

export function GradingQueueSkeleton() {
  return (
    <div className="rounded-xl border">
      <div className="border-b px-4 py-3">
        <Skeleton className="h-5 w-32" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="ml-auto h-8 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function GradingDetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:flex-row">
      <div className="flex-1 rounded-xl border p-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-4 h-64 w-full rounded-lg" />
      </div>
      <div className="w-full rounded-xl border p-6 md:w-80">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-4 h-10 w-full" />
        <Skeleton className="mt-3 h-24 w-full" />
        <Skeleton className="mt-3 h-10 w-full" />
      </div>
    </div>
  );
}
