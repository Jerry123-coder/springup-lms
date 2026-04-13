import { Suspense } from "react";
import { Users2 } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AdminCohortManager } from "@/components/dashboard/admin-cohort-manager";
import { Skeleton } from "@/components/ui/skeleton";

type ProfileRow   = { id: string; full_name: string; email: string };
type CohortRow    = { id: string; name: string; description: string | null; instructor_id: string; created_at: string };
type CohortStudent = { cohort_id: string; student_id: string };
type CohortInstructorRow = { cohort_id: string; instructor_id: string };
type SubRow       = { lesson_id: string; student_id: string };
type LessonRow    = { id: string };

async function CohortData() {
  const supabase = await createClient();

  const [cohortsRes, cohortStudentsRes, cohortInstructorsRes, instructorsRes, studentsRes, lessonsRes, subsRes] =
    await Promise.all([
      supabase.from("cohorts").select("id, name, description, instructor_id, created_at").order("created_at", { ascending: false }),
      supabase.from("cohort_students").select("cohort_id, student_id"),
      supabase.from("cohort_instructors").select("cohort_id, instructor_id"),
      supabase.from("profiles").select("id, full_name, email").eq("role", "instructor").order("full_name"),
      supabase.from("profiles").select("id, full_name, email").eq("role", "student").order("full_name"),
      supabase.from("lessons").select("id"),
      supabase.from("submissions").select("lesson_id, student_id"),
    ]);

  const cohorts         = (cohortsRes.data ?? []) as CohortRow[];
  const cohortStudentRows = (cohortStudentsRes.data ?? []) as CohortStudent[];
  const cohortInstructorRows = cohortInstructorsRes.error
    ? []
    : ((cohortInstructorsRes.data ?? []) as CohortInstructorRow[]);
  const instructors     = (instructorsRes.data ?? []) as ProfileRow[];
  const allStudents     = (studentsRes.data ?? []) as ProfileRow[];
  const totalLessons    = (lessonsRes.data ?? []).length;
  const subs            = (subsRes.data ?? []) as SubRow[];

  const instructorById = new Map(instructors.map((i) => [i.id, i]));
  const studentById    = new Map(allStudents.map((s) => [s.id, s]));

  // Submitted lessons per student
  const submittedByStudent = new Map<string, number>();
  for (const s of subs) {
    submittedByStudent.set(s.student_id, (submittedByStudent.get(s.student_id) ?? 0) + 1);
  }

  // Group cohort_students by cohort
  const membersByCohort = new Map<string, string[]>();
  for (const cs of cohortStudentRows) {
    const arr = membersByCohort.get(cs.cohort_id) ?? [];
    arr.push(cs.student_id);
    membersByCohort.set(cs.cohort_id, arr);
  }

  const instructorIdsByCohort = new Map<string, string[]>();
  for (const row of cohortInstructorRows) {
    const arr = instructorIdsByCohort.get(row.cohort_id) ?? [];
    arr.push(row.instructor_id);
    instructorIdsByCohort.set(row.cohort_id, arr);
  }

  const enrichedCohorts = cohorts.map((c) => {
    const memberIds = membersByCohort.get(c.id) ?? [];
    const students = memberIds.map((id) => studentById.get(id)).filter(Boolean) as ProfileRow[];
    const avgPct = students.length > 0 && totalLessons > 0
      ? Math.round(
          students.reduce((sum, s) => sum + (submittedByStudent.get(s.id) ?? 0), 0) /
          (students.length * totalLessons) * 100
        )
      : 0;
    const fromJunction = instructorIdsByCohort.get(c.id) ?? [];
    const primary = c.instructor_id;
    const instructor_ids =
      fromJunction.length > 0
        ? [primary, ...fromJunction.filter((id) => id !== primary)]
        : [primary];
    const instructorNamesDisplay = instructor_ids
      .map((id) => instructorById.get(id))
      .filter(Boolean)
      .map((p) => p!.full_name || p!.email)
      .join(", ") || "Unknown";
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      instructor_id: c.instructor_id,
      instructor_ids,
      instructorNamesDisplay,
      created_at: c.created_at,
      students,
      avgPct,
    };
  });

  return (
    <AdminCohortManager
      cohorts={enrichedCohorts}
      instructors={instructors}
      allStudents={allStudents}
    />
  );
}

function CohortSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-card p-5 shadow-ambient">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-4 w-4 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminCohortsPage() {
  return (
    <>
      <DashboardHeader heading="Cohort Management" />
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
              <Users2 className="h-6 w-6 text-[#94d3c1]" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#f0f7f5]">Cohort Management</h2>
              <p className="mt-1 text-sm text-[#c8ebe2]/70">
                Create and manage class cohorts — assign instructors, add students, and track group progress.
              </p>
            </div>
          </div>
        </div>

        <Suspense fallback={<CohortSkeleton />}>
          <CohortData />
        </Suspense>
      </div>
    </>
  );
}
