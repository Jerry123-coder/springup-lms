import { Suspense } from "react";
import {
  Users,
  BookOpen,
  ClipboardCheck,
  Heart,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({
  title,
  value,
  icon: Icon,
  accent,
  iconColor,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
          <Skeleton className="mt-4 h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

async function StatsCards() {
  const supabase = await createClient();

  const [students, courses, pending] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "student"),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Students"
        value={String(students.count ?? 0)}
        icon={Users}
        accent="bg-sky-500/10"
        iconColor="text-sky-600"
      />
      <StatCard
        title="Total Courses"
        value={String(courses.count ?? 0)}
        icon={BookOpen}
        accent="bg-emerald-500/10"
        iconColor="text-emerald-600"
      />
      <StatCard
        title="Pending Grades"
        value={String(pending.count ?? 0)}
        icon={ClipboardCheck}
        accent="bg-amber-500/10"
        iconColor="text-amber-600"
      />
      <StatCard
        title="Total Support Raised"
        value="GHS 2,450"
        icon={Heart}
        accent="bg-rose-500/10"
        iconColor="text-rose-600"
      />
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <>
      <DashboardHeader heading="Mission Overview" />
      <div className="flex-1 space-y-6 p-6">
        <Suspense fallback={<StatsSkeleton />}>
          <StatsCards />
        </Suspense>
      </div>
    </>
  );
}
