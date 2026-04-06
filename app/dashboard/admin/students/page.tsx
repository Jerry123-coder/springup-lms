import { Suspense } from "react";
import { Users } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AdminStudentDirectory } from "@/components/dashboard/admin-student-directory";
import { Skeleton } from "@/components/ui/skeleton";

type ProfileRow = { id: string; full_name: string; email: string; created_at: string };
type LessonRow  = { id: string; course_id: string };
type SubRow     = { lesson_id: string; student_id: string };
type ProgRow    = { lesson_id: string; student_id: string; updated_at: string };
type AssignRow  = { student_id: string; instructor_id: string };

async function StudentDirectoryData() {
  const supabase = await createClient();

  const [studentsRes, instructorsRes, lessonsRes, subsRes, progressRes, assignRes] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name, email, created_at").eq("role", "student").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, email").eq("role", "instructor").order("full_name"),
      supabase.from("lessons").select("id, course_id"),
      supabase.from("submissions").select("lesson_id, student_id"),
      supabase.from("lesson_progress").select("lesson_id, student_id, updated_at"),
      supabase.from("instructor_student_assignments").select("student_id, instructor_id"),
    ]);

  const students    = (studentsRes.data ?? []) as ProfileRow[];
  const instructors = (instructorsRes.data ?? []) as ProfileRow[];
  const allLessons  = (lessonsRes.data ?? []) as LessonRow[];
  const subs        = (subsRes.data ?? []) as SubRow[];
  const progress    = (progressRes.data ?? []) as ProgRow[];
  const assigns     = (assignRes.data ?? []) as AssignRow[];

  const totalLessons = allLessons.length;

  // Per-student: submitted lessons + last active
  const submittedByStudent = new Map<string, Set<string>>();
  for (const s of subs) {
    const set = submittedByStudent.get(s.student_id) ?? new Set();
    set.add(s.lesson_id);
    submittedByStudent.set(s.student_id, set);
  }

  const lastActiveByStudent = new Map<string, string>();
  for (const p of progress) {
    const existing = lastActiveByStudent.get(p.student_id);
    if (!existing || p.updated_at > existing) {
      lastActiveByStudent.set(p.student_id, p.updated_at);
    }
  }
  for (const s of subs) {
    // Also check submissions for last active (we don't have created_at per row here, use progress)
  }

  const assignByStudent = new Map<string, string>();
  for (const a of assigns) assignByStudent.set(a.student_id, a.instructor_id);

  const instructorById = new Map(instructors.map((i) => [i.id, i]));

  const enriched = students.map((s) => {
    const submitted = submittedByStudent.get(s.id)?.size ?? 0;
    const pct = totalLessons > 0 ? Math.round((submitted / totalLessons) * 100) : 0;
    const instrId = assignByStudent.get(s.id) ?? null;
    const instr = instrId ? instructorById.get(instrId) : null;
    return {
      id: s.id,
      full_name: s.full_name,
      email: s.email,
      created_at: s.created_at,
      pct,
      submittedLessons: submitted,
      totalLessons,
      lastActive: lastActiveByStudent.get(s.id) ?? null,
      instructorId: instrId,
      instructorName: instr?.full_name || instr?.email || null,
    };
  });

  return (
    <AdminStudentDirectory
      students={enriched}
      instructors={instructors.map((i) => ({ id: i.id, full_name: i.full_name, email: i.email }))}
    />
  );
}

function DirectorySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full rounded-2xl" />
      <div className="overflow-hidden rounded-2xl bg-card shadow-ambient">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b px-5 py-4 last:border-b-0">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-8 w-32 rounded-xl" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminStudentsPage() {
  return (
    <>
      <DashboardHeader heading="Student Directory" />
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
              <Users className="h-6 w-6 text-[#94d3c1]" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#f0f7f5]">Student Directory</h2>
              <p className="mt-1 text-sm text-[#c8ebe2]/70">
                Manage all enrolled students, track progress, and assign instructors.
              </p>
            </div>
          </div>
        </div>

        <Suspense fallback={<DirectorySkeleton />}>
          <StudentDirectoryData />
        </Suspense>
      </div>
    </>
  );
}
