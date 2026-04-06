import { Suspense } from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  ClipboardCheck,
  BarChart3,
  Settings,
  Shield,
  Users,
  UserCheck,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Skeleton } from "@/components/ui/skeleton";

// ── Role permissions matrix ───────────────────────────────────────
const permissionsMatrix = [
  {
    capability: "Modify Curriculum",
    description: "Create, edit and delete courses and lessons",
    admin: true,
    instructor: "conditional", // only if can_edit_courses = true
    student: false,
  },
  {
    capability: "Grade Submissions",
    description: "Review student work and assign grades",
    admin: true,
    instructor: true,
    student: false,
  },
  {
    capability: "View Analytics",
    description: "Access platform-wide metrics and reports",
    admin: true,
    instructor: false,
    student: false,
  },
  {
    capability: "Manage Users",
    description: "Change roles and assign students to instructors",
    admin: true,
    instructor: false,
    student: false,
  },
  {
    capability: "Manage Cohorts",
    description: "Create and manage class cohorts",
    admin: true,
    instructor: true,
    student: false,
  },
  {
    capability: "View Own Progress",
    description: "Access personal learning path and submissions",
    admin: true,
    instructor: true,
    student: true,
  },
  {
    capability: "Submit Assignments",
    description: "Submit lesson work for review",
    admin: false,
    instructor: false,
    student: true,
  },
] as const;

function PermCell({ value }: { value: boolean | "conditional" }) {
  if (value === "conditional") {
    return (
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
          Conditional
        </span>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      {value ? (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
          <Check className="h-3.5 w-3.5 text-primary" />
        </div>
      ) : (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
          <X className="h-3 w-3 text-muted-foreground/40" />
        </div>
      )}
    </div>
  );
}

// ── System activity log ───────────────────────────────────────────
type SubRow  = { id: string; created_at: string; status: string; student_id: string };
type ProfRow = { id: string; full_name: string; email: string };

async function SystemLog() {
  const supabase = await createClient();

  const [subsRes, newUsersRes] = await Promise.all([
    supabase
      .from("submissions")
      .select("id, created_at, status, student_id")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("profiles")
      .select("id, full_name, email, created_at, role")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const subs     = (subsRes.data ?? []) as SubRow[];
  const newUsers = (newUsersRes.data ?? []) as (ProfRow & { created_at: string; role: string })[];

  const studentIds = [...new Set(subs.map((s) => s.student_id))];
  const profMap = new Map<string, ProfRow>();
  if (studentIds.length > 0) {
    const { data } = await supabase.from("profiles").select("id, full_name, email").in("id", studentIds);
    for (const p of (data ?? []) as ProfRow[]) profMap.set(p.id, p);
  }

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
      icon: ClipboardCheck,
      dotColor: s.status === "pending" ? "bg-amber-500" : "bg-primary",
      label: `${profMap.get(s.student_id)?.full_name || "A student"} ${s.status === "pending" ? "submitted an assignment" : "had their submission reviewed"}`,
      time: s.created_at,
    })),
    ...newUsers.map((u) => ({
      id: `user-${u.id}`,
      icon: u.role === "instructor" ? UserCheck : Users,
      dotColor: "bg-sky-500",
      label: `${u.full_name || u.email} joined as ${u.role}`,
      time: u.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 12);

  if (events.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No activity yet.</p>;
  }

  return (
    <div className="divide-y">
      {events.map((e) => (
        <div key={e.id} className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-muted/30">
          <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${e.dotColor}`} />
          <p className="flex-1 text-sm text-foreground">{e.label}</p>
          <span className="shrink-0 tabular-nums text-[11px] text-muted-foreground/60">{timeAgo(e.time)}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <>
      <DashboardHeader heading="Settings" />
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div
          className="relative overflow-hidden rounded-[1.75rem] p-6 shadow-ambient sm:p-8"
          style={{ background: "linear-gradient(135deg, #001a16 0%, #00342b 40%, #005a4d 80%, #0a7a6a 100%)" }}
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, rgba(255,204,170,0.9) 0%, transparent 70%)" }} />
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#94d3c1]/20">
              <Settings className="h-6 w-6 text-[#94d3c1]" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#f0f7f5]">Platform Settings</h2>
              <p className="mt-1 text-sm text-[#c8ebe2]/70">
                Review role capabilities and monitor system activity across the platform.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left: permissions matrix */}
          <div className="space-y-6">
            {/* Role permissions */}
            <div className="rounded-2xl bg-card p-6 shadow-ambient">
              <div className="mb-5 flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#ffdcc2]" />
                <h3 className="font-display text-base font-semibold">User Role Permissions</h3>
              </div>
              <div className="overflow-hidden rounded-xl border">
                <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b bg-muted/50 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Capability</span>
                  <span className="w-20 text-center">Admin</span>
                  <span className="w-24 text-center">Instructor</span>
                  <span className="w-20 text-center">Student</span>
                </div>
                <div className="divide-y">
                  {permissionsMatrix.map((row) => (
                    <div
                      key={row.capability}
                      className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/20"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">{row.capability}</p>
                        <p className="text-xs text-muted-foreground">{row.description}</p>
                      </div>
                      <div className="w-20"><PermCell value={row.admin} /></div>
                      <div className="w-24"><PermCell value={row.instructor} /></div>
                      <div className="w-20"><PermCell value={row.student} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                <span className="font-semibold text-amber-600 dark:text-amber-400">Conditional</span> — instructor course editing requires the
                {" "}<Link href="/dashboard/admin/instructors" className="text-primary underline">per-instructor permission toggle</Link> to be enabled.
              </p>
            </div>

            {/* Quick links */}
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: "Manage User Roles", desc: "View all users and change roles", href: "/dashboard/admin/users", icon: Users },
                { title: "Course Editing Rights", desc: "Toggle instructor permissions", href: "/dashboard/admin/instructors", icon: BookOpen },
                { title: "Student Assignments", desc: "Assign students to instructors", href: "/dashboard/admin/students", icon: UserCheck },
                { title: "View Analytics", desc: "Platform-wide metrics", href: "/dashboard/admin/analytics", icon: BarChart3 },
              ].map(({ title, desc, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 rounded-2xl bg-muted/40 p-4 transition-all hover:bg-secondary hover:ring-1 hover:ring-primary/20"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card text-primary shadow-sm transition-colors group-hover:bg-primary group-hover:text-[#f0f7f5]">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right: system log */}
          <div className="rounded-2xl bg-card shadow-ambient">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h3 className="font-display text-sm font-semibold">System Activity</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Recent platform events</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            </div>
            <Suspense fallback={
              <div className="divide-y">
                {Array.from({length:6}).map((_,i)=>(
                  <div key={i} className="flex items-start gap-3 px-5 py-3">
                    <Skeleton className="mt-1.5 h-2 w-2 rounded-full shrink-0" />
                    <Skeleton className="flex-1 h-4" />
                    <Skeleton className="h-3 w-12 shrink-0" />
                  </div>
                ))}
              </div>
            }>
              <SystemLog />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
