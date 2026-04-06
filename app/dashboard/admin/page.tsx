import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Users,
  Users2,
  UserCheck,
  Zap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Skeleton } from "@/components/ui/skeleton";

// ── Stat card ────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  accent = false,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 shadow-ambient transition-transform duration-200 hover:-translate-y-0.5 ${
        accent
          ? "bg-gradient-primary text-[#f0f7f5]"
          : "bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-[11px] font-semibold uppercase tracking-wider ${accent ? "text-[#94d3c1]/70" : "text-muted-foreground"}`}>
            {title}
          </p>
          <p className={`mt-2 font-display text-3xl font-bold tabular-nums tracking-tight ${accent ? "text-[#f0f7f5]" : "text-foreground"}`}>
            {value}
          </p>
          {sub && (
            <p className={`mt-1 text-xs ${accent ? "text-[#94d3c1]/60" : "text-muted-foreground"}`}>
              {sub}
            </p>
          )}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accent ? "bg-white/15" : "bg-secondary text-primary"}`}>
          <Icon className={`h-5 w-5 ${accent ? "text-[#94d3c1]" : ""}`} />
        </div>
      </div>
    </div>
  );
}

// ── Quick-action card ─────────────────────────────────────────────
function QuickCard({
  title,
  desc,
  href,
  icon: Icon,
}: {
  title: string;
  desc: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl bg-card p-5 shadow-ambient transition-all duration-200 hover:-translate-y-0.5 hover:ring-1 hover:ring-primary/20"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-[#f0f7f5]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

// ── Async stats section ───────────────────────────────────────────
async function StatsSection() {
  const supabase = await createClient();

  const [
    studentsRes,
    instructorsRes,
    coursesRes,
    lessonsRes,
    pendingRes,
    cohortsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "instructor"),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("lessons").select("*", { count: "exact", head: true }),
    supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("cohorts").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard title="Total Students" value={studentsRes.count ?? 0} sub="Enrolled learners" icon={Users} accent />
      <StatCard title="Instructors" value={instructorsRes.count ?? 0} sub="Active educators" icon={UserCheck} />
      <StatCard title="Courses" value={coursesRes.count ?? 0} sub={`${lessonsRes.count ?? 0} total lessons`} icon={BookOpen} />
      <StatCard title="Active Cohorts" value={cohortsRes.count ?? 0} sub="Classes in session" icon={Users2} />
      <StatCard title="Pending Reviews" value={pendingRes.count ?? 0} sub="Awaiting grading" icon={ClipboardCheck} />
      <StatCard title="Completion Rate" value="—" sub="See Analytics for details" icon={BarChart3} />
    </div>
  );
}

// ── Recent activity feed ──────────────────────────────────────────
type SubRow = { id: string; created_at: string; status: string; student_id: string; lesson_id: string };
type ProfileRow = { id: string; full_name: string; email: string };

async function ActivityFeed() {
  const supabase = await createClient();

  const [subsRes, newUsersRes] = await Promise.all([
    supabase
      .from("submissions")
      .select("id, created_at, status, student_id, lesson_id")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("profiles")
      .select("id, full_name, email, created_at")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const subs = (subsRes.data ?? []) as SubRow[];
  const newUsers = (newUsersRes.data ?? []) as (ProfileRow & { created_at: string })[];

  // Fetch student profiles for submissions
  const studentIds = [...new Set(subs.map((s) => s.student_id))];
  const profilesRes = studentIds.length > 0
    ? await supabase.from("profiles").select("id, full_name, email").in("id", studentIds)
    : { data: [] };
  const profileMap = new Map(
    ((profilesRes.data ?? []) as ProfileRow[]).map((p) => [p.id, p])
  );

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  const events = [
    ...subs.map((s) => ({
      id: `sub-${s.id}`,
      type: "submission" as const,
      name: profileMap.get(s.student_id)?.full_name || "A student",
      detail: s.status === "pending" ? "submitted an assignment" : "got their work reviewed",
      time: s.created_at,
      dot: s.status === "pending" ? "bg-amber-500" : "bg-primary",
    })),
    ...newUsers.map((u) => ({
      id: `user-${u.id}`,
      type: "signup" as const,
      name: u.full_name || u.email,
      detail: "joined the platform",
      time: u.created_at,
      dot: "bg-sky-500",
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8);

  if (events.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No recent activity yet.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {events.map((e) => (
        <div key={e.id} className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/50">
          <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${e.dot}`} />
          <p className="flex-1 text-sm text-foreground">
            <span className="font-semibold">{e.name}</span>{" "}
            <span className="text-muted-foreground">{e.detail}</span>
          </p>
          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/60">
            {timeAgo(e.time)}
          </span>
        </div>
      ))}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-card p-5 shadow-ambient">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-14" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-11 w-11 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  return (
    <>
      <DashboardHeader heading="Mission Control" />
      <div className="flex-1 space-y-6 p-6">
        {/* Hero */}
        <section
          className="relative overflow-hidden rounded-[1.75rem] shadow-ambient"
          style={{
            background:
              "linear-gradient(128deg, #001a16 0%, #00342b 28%, #005a4d 55%, #087a6a 78%, #0a5c52 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(255,204,170,0.5) 0%, transparent 70%)" }}
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-12 h-64 w-64 rounded-full opacity-25 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(148,211,193,0.6) 0%, transparent 70%)" }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.10]"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.55) 1.2px, transparent 1.2px)",
              backgroundSize: "18px 18px",
            }}
          />
          <div className="pointer-events-none absolute -bottom-8 right-0 sm:right-6 sm:top-1/2 sm:-translate-y-1/2">
            <GraduationCap className="h-44 w-44 text-white/8 sm:h-52 sm:w-52" strokeWidth={1} />
          </div>

          <div className="relative z-10 px-6 py-10 sm:px-12 sm:py-14 md:px-16">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#94d3c1]">
              System Administrator
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-[#f0f7f5] sm:text-4xl">
              Platform Overview
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#c8ebe2]/80">
              Monitor all students, instructors, cohorts, and courses from one control centre.
              Manage permissions, review progress, and keep the platform running smoothly.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/admin/students"
                className="inline-flex items-center gap-2 rounded-xl bg-[#94d3c1] px-5 py-2.5 text-sm font-bold text-[#001a16] transition-opacity hover:opacity-90"
              >
                View Students <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/admin/analytics"
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-[#f0f7f5] transition-colors hover:bg-white/25"
              >
                <BarChart3 className="h-4 w-4" /> Analytics
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <Suspense fallback={<StatsSkeleton />}>
          <StatsSection />
        </Suspense>

        {/* Main grid: activity + quick actions */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Activity feed */}
          <div className="rounded-[1.75rem] bg-card p-6 shadow-ambient">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-semibold">Recent Activity</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Latest platform events</p>
              </div>
              <Zap className="h-5 w-5 text-[#ffdcc2]" />
            </div>
            <Suspense fallback={<div className="space-y-2">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-10 w-full rounded-xl"/>)}</div>}>
              <ActivityFeed />
            </Suspense>
          </div>

          {/* Quick actions */}
          <div className="space-y-3">
            <div className="rounded-[1.75rem] bg-muted/40 p-5 shadow-ambient">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Actions
              </p>
              <div className="space-y-2">
                <QuickCard title="Student Directory" desc="View all students + progress" href="/dashboard/admin/students" icon={Users} />
                <QuickCard title="Instructor Management" desc="Manage permissions + assignments" href="/dashboard/admin/instructors" icon={UserCheck} />
                <QuickCard title="Cohort Management" desc="Create and manage classes" href="/dashboard/admin/cohorts" icon={Users2} />
                <QuickCard title="Course Management" desc="Edit curriculum and lessons" href="/dashboard/admin/courses" icon={BookOpen} />
                <QuickCard title="Platform Analytics" desc="Metrics, trends, performance" href="/dashboard/admin/analytics" icon={BarChart3} />
                <QuickCard title="Pending Reviews" desc="Submissions awaiting grades" href="/dashboard/admin/courses" icon={ClipboardCheck} />
                <QuickCard title="Settings" desc="Role permissions + system config" href="/dashboard/admin/settings" icon={CheckCircle2} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
