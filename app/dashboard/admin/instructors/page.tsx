import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Lock,
  Pencil,
  UserCheck,
  Users,
  Users2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { InstructorPermissionToggle } from "@/components/dashboard/instructor-permission-toggle";
import { Skeleton } from "@/components/ui/skeleton";

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  can_edit_courses: boolean;
  created_at: string;
};

async function InstructorGrid() {
  const supabase = await createClient();

  const [instructorsRes, assignsRes, cohortsRes, cohortInstRes, subsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, can_edit_courses, created_at")
      .eq("role", "instructor")
      .order("created_at", { ascending: false }),
    supabase
      .from("instructor_student_assignments")
      .select("instructor_id, student_id"),
    supabase
      .from("cohorts")
      .select("id, instructor_id, name"),
    supabase
      .from("cohort_instructors")
      .select("cohort_id, instructor_id"),
    supabase
      .from("submissions")
      .select("id, status, lesson_id")
      .eq("status", "pending"),
  ]);

  const instructors = (instructorsRes.data ?? []) as ProfileRow[];

  type AssignRow = { instructor_id: string; student_id: string };
  type CohortRow = { id: string; instructor_id: string; name: string };
  type CohortInstRow = { cohort_id: string; instructor_id: string };

  const assigns  = (assignsRes.data ?? []) as AssignRow[];
  const cohorts  = (cohortsRes.data ?? []) as CohortRow[];
  const cohortInst = cohortInstRes.error
    ? []
    : ((cohortInstRes.data ?? []) as CohortInstRow[]);

  // Build per-instructor maps
  const studentsByInstructor = new Map<string, number>();
  for (const a of assigns) {
    studentsByInstructor.set(a.instructor_id, (studentsByInstructor.get(a.instructor_id) ?? 0) + 1);
  }

  const cohortSetByInstructor = new Map<string, Set<string>>();
  function addCohort(instructorId: string, cohortId: string) {
    if (!cohortSetByInstructor.has(instructorId)) {
      cohortSetByInstructor.set(instructorId, new Set());
    }
    cohortSetByInstructor.get(instructorId)!.add(cohortId);
  }
  for (const c of cohorts) {
    addCohort(c.instructor_id, c.id);
  }
  for (const row of cohortInst) {
    addCohort(row.instructor_id, row.cohort_id);
  }
  const cohortsByInstructor = new Map<string, number>();
  for (const [instId, set] of cohortSetByInstructor) {
    cohortsByInstructor.set(instId, set.size);
  }

  // Pending submissions count is platform-wide; show total for all instructors
  const pendingTotal = subsRes.data?.length ?? 0;

  if (instructors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-card px-6 py-16 text-center shadow-ambient">
        <GraduationCap className="mb-3 h-10 w-10 text-muted-foreground/40" />
        <h3 className="font-display text-base font-semibold">No instructors yet</h3>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Promote a user to instructor role from the Settings page to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {instructors.map((inst) => {
        const studentCount = studentsByInstructor.get(inst.id) ?? 0;
        const cohortCount  = cohortsByInstructor.get(inst.id) ?? 0;
        const nameInitials = inst.full_name
          .split(" ")
          .slice(0, 2)
          .map((p) => p[0])
          .join("")
          .toUpperCase() || inst.email.slice(0, 2).toUpperCase();

        return (
          <div
            key={inst.id}
            className="flex flex-col overflow-hidden rounded-2xl bg-card shadow-ambient ring-1 ring-border/40 transition-all duration-200 hover:-translate-y-0.5 hover:ring-primary/20"
          >
            {/* Card header */}
            <div
              className="relative p-5"
              style={{ background: "linear-gradient(135deg, #001a16 0%, #00342b 50%, #005a4d 100%)" }}
            >
              <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#94d3c1]/20 font-display text-sm font-bold text-[#94d3c1]">
                    {nameInitials}
                  </div>
                  <div>
                    <p className="font-display text-sm font-semibold text-[#f0f7f5]">
                      {inst.full_name || "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-[#94d3c1]/60">{inst.email}</p>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${inst.can_edit_courses ? "bg-[#94d3c1]/20 text-[#94d3c1]" : "bg-white/10 text-white/40"}`}>
                  {inst.can_edit_courses ? "Editor" : "Viewer"}
                </span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 divide-x border-b">
              {[
                { label: "Students", value: studentCount, icon: Users },
                { label: "Cohorts", value: cohortCount, icon: Users2 },
                { label: "Pending", value: pendingTotal, icon: ClipboardCheck },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex flex-col items-center gap-1 py-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <p className="font-display text-lg font-bold tabular-nums">{value}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            {/* Course editing permission */}
            <div className="flex items-center justify-between gap-3 border-b px-5 py-3">
              <div className="flex items-center gap-2">
                {inst.can_edit_courses ? (
                  <Pencil className="h-4 w-4 text-primary" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-xs font-semibold text-foreground">Course Editing</p>
                  <p className="text-[10px] text-muted-foreground">
                    {inst.can_edit_courses
                      ? "Can create, edit and delete courses"
                      : "View-only access to courses"}
                  </p>
                </div>
              </div>
              <InstructorPermissionToggle
                instructorId={inst.id}
                canEditCourses={inst.can_edit_courses}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 p-4">
              <Link
                href={`/dashboard/instructor/students`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-secondary py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-[#f0f7f5]"
              >
                <Users className="h-3.5 w-3.5" /> View Students
              </Link>
              <Link
                href={`/dashboard/instructor/courses`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-secondary py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-[#f0f7f5]"
              >
                <BookOpen className="h-3.5 w-3.5" /> Courses
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl bg-card shadow-ambient">
          <div className="bg-muted/50 p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x border-b">
            {[0,1,2].map(i => (
              <div key={i} className="flex flex-col items-center gap-1 py-3">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-2.5 w-12" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <div className="space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-40" />
            </div>
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
          <div className="flex gap-2 p-4">
            <Skeleton className="h-8 flex-1 rounded-xl" />
            <Skeleton className="h-8 flex-1 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminInstructorsPage() {
  return (
    <>
      <DashboardHeader heading="Instructor Management" />
      <div className="flex-1 space-y-6 p-6">
        {/* Header banner */}
        <div
          className="relative overflow-hidden rounded-[1.75rem] p-6 shadow-ambient sm:p-8"
          style={{ background: "linear-gradient(135deg, #001a16 0%, #00342b 40%, #005a4d 80%, #0a7a6a 100%)" }}
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, rgba(255,204,170,0.9) 0%, transparent 70%)" }} />
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#94d3c1]/20">
              <UserCheck className="h-6 w-6 text-[#94d3c1]" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#f0f7f5]">Instructor Management</h2>
              <p className="mt-1 text-sm text-[#c8ebe2]/70">
                Control course editing privileges, view student assignments, and monitor instructor activity.
              </p>
            </div>
          </div>
        </div>

        {/* Permission legend */}
        <div className="flex flex-wrap gap-4 rounded-2xl bg-card p-4 shadow-ambient text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground"><span className="font-semibold text-foreground">Editor</span> — can create, edit and delete courses &amp; lessons</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            <span className="text-muted-foreground"><span className="font-semibold text-foreground">Viewer</span> — can view courses but not make changes</span>
          </div>
        </div>

        <Suspense fallback={<GridSkeleton />}>
          <InstructorGrid />
        </Suspense>
      </div>
    </>
  );
}
