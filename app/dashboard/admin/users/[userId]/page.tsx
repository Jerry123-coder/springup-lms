import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Mail,
  Shield,
  TrendingUp,
  User,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { RoleSelector } from "@/components/dashboard/role-selector";
import { StudentInstructorAssign } from "@/components/dashboard/student-instructor-assign";
import { AdminUserProfileEditor } from "@/components/dashboard/admin-user-profile-editor";
import { AdminDeleteUserButton } from "@/components/dashboard/admin-delete-user-button";
import type { Profile, UserRole } from "@/lib/types/database";

type PageProps = { params: Promise<{ userId: string }> };

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { userId } = await params;
  const supabase = await createClient();

  const { data: profileRow, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !profileRow) notFound();
  const profile = profileRow as Profile;

  const [
    instructorsRes,
    assignRes,
    cohortStudentRes,
    subsRes,
    progressRes,
    coursesRes,
    lessonsRes,
    certsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email").eq("role", "instructor").order("full_name"),
    supabase.from("instructor_student_assignments").select("instructor_id").eq("student_id", userId).maybeSingle(),
    supabase.from("cohort_students").select("cohort_id").eq("student_id", userId),
    supabase
      .from("submissions")
      .select("id, status, grade, created_at, lesson_id")
      .eq("student_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("lesson_progress").select("lesson_id, updated_at").eq("student_id", userId),
    supabase.from("courses").select("id, title"),
    supabase.from("lessons").select("id, course_id"),
    supabase.from("certificates").select("id, course_id, issued_at").eq("student_id", userId),
  ]);

  const instructors = (instructorsRes.data ?? []) as { id: string; full_name: string; email: string }[];
  const assign = assignRes.data as { instructor_id: string } | null;

  const cohortIds = ((cohortStudentRes.data ?? []) as { cohort_id: string }[])
    .map((r) => r.cohort_id)
    .filter(Boolean);
  let cohortNames: { id: string; name: string }[] = [];
  if (cohortIds.length > 0) {
    const { data: ch } = await supabase.from("cohorts").select("id, name").in("id", cohortIds);
    cohortNames = (ch ?? []) as { id: string; name: string }[];
  }

  const submissions = (subsRes.data ?? []) as {
    id: string;
    status: string;
    grade: number | null;
    created_at: string;
    lesson_id: string;
  }[];

  const lessonIdsForSubs = [...new Set(submissions.map((s) => s.lesson_id))];
  let lessonMeta = new Map<string, { title: string; courseTitle: string }>();
  if (lessonIdsForSubs.length > 0) {
    const { data: les } = await supabase
      .from("lessons")
      .select("id, title, course_id")
      .in("id", lessonIdsForSubs);
    const lessons = (les ?? []) as { id: string; title: string; course_id: string }[];
    const cids = [...new Set(lessons.map((l) => l.course_id))];
    const { data: crs } = await supabase.from("courses").select("id, title").in("id", cids);
    const courseTitle = new Map((crs ?? []).map((c: { id: string; title: string }) => [c.id, c.title]));
    for (const l of lessons) {
      lessonMeta.set(l.id, {
        title: l.title,
        courseTitle: courseTitle.get(l.course_id) ?? "—",
      });
    }
  }

  const progress = (progressRes.data ?? []) as { lesson_id: string; updated_at: string }[];
  const allCourses = (coursesRes.data ?? []) as { id: string; title: string }[];
  const allLessons = (lessonsRes.data ?? []) as { id: string; course_id: string }[];

  const lessonsByCourse = new Map<string, number>();
  for (const l of allLessons) {
    lessonsByCourse.set(l.course_id, (lessonsByCourse.get(l.course_id) ?? 0) + 1);
  }

  const progressLessonIds = new Set(progress.map((p) => p.lesson_id));
  const submittedLessonIds = new Set(submissions.map((s) => s.lesson_id));

  const courseProgress = allCourses.map((c) => {
    const total = lessonsByCourse.get(c.id) ?? 0;
    const lessonIds = allLessons.filter((l) => l.course_id === c.id).map((l) => l.id);
    let done = 0;
    for (const lid of lessonIds) {
      if (progressLessonIds.has(lid) || submittedLessonIds.has(lid)) done++;
    }
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { ...c, totalLessons: total, done, pct };
  });

  const certs = (certsRes.data ?? []) as { id: string; course_id: string; issued_at: string }[];
  const courseTitleById = new Map(allCourses.map((c) => [c.id, c.title]));

  return (
    <>
      <DashboardHeader heading={profile.full_name || profile.email} />
      <div className="flex-1 space-y-6 p-6">
        <Link
          href="/dashboard/admin/users"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to users
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <User className="h-7 w-7" />
            </div>
            <div>
              <p className="font-display text-xl font-bold">{profile.full_name || "—"}</p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {profile.email}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Joined{" "}
                {new Date(profile.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold capitalize">
              <Shield className="h-3 w-3" />
              {profile.role}
            </span>
            <RoleSelector userId={profile.id} currentRole={profile.role as UserRole} />
            <AdminDeleteUserButton userId={profile.id} userLabel={profile.full_name || profile.email} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-card p-6 shadow-ambient">
            <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold">
              <GraduationCap className="h-4 w-4 text-primary" />
              Profile details
            </h3>
            <AdminUserProfileEditor
              userId={profile.id}
              initialFullName={profile.full_name}
              initialEmail={profile.email}
            />
          </div>

          {profile.role === "student" && (
            <div className="rounded-2xl border bg-card p-6 shadow-ambient">
              <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold">
                <Users className="h-4 w-4 text-primary" />
                Instructor assignment
              </h3>
              <StudentInstructorAssign
                studentId={profile.id}
                instructors={instructors}
                currentInstructorId={assign?.instructor_id ?? null}
              />
              <div className="mt-4 border-t pt-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Cohorts</p>
                {cohortNames.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Not enrolled in any cohort.</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {cohortNames.map((c) => (
                      <li key={c.id}>
                        <Link href="/dashboard/admin/cohorts" className="text-primary hover:underline">
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {(profile.role === "student" || profile.role === "instructor") && (
          <div className="rounded-2xl border bg-card p-6 shadow-ambient">
            <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-primary" />
              Course progress
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {courseProgress.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.done}/{c.totalLessons} lessons touched
                    </p>
                  </div>
                  <span className="shrink-0 font-display text-lg font-bold tabular-nums text-primary">
                    {c.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {profile.role === "student" && (
          <>
            <div className="rounded-2xl border bg-card p-6 shadow-ambient">
              <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                Recent submissions ({submissions.length})
              </h3>
              {submissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No submissions yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="pb-2 pr-4">Lesson</th>
                        <th className="pb-2 pr-4">Course</th>
                        <th className="pb-2 pr-4">Status</th>
                        <th className="pb-2">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.slice(0, 20).map((s) => {
                        const meta = lessonMeta.get(s.lesson_id);
                        return (
                          <tr key={s.id} className="border-b border-border/50 last:border-0">
                            <td className="py-2 pr-4">{meta?.title ?? "—"}</td>
                            <td className="py-2 pr-4 text-muted-foreground">{meta?.courseTitle ?? "—"}</td>
                            <td className="py-2 pr-4 capitalize">{s.status}</td>
                            <td className="py-2">{s.grade != null ? `${s.grade}%` : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-ambient">
              <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold">
                <BookOpen className="h-4 w-4 text-primary" />
                Certificates
              </h3>
              {certs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No certificates issued.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {certs.map((c) => (
                    <li key={c.id} className="flex justify-between gap-4">
                      <span>{courseTitleById.get(c.course_id) ?? "Course"}</span>
                      <span className="text-muted-foreground">
                        {new Date(c.issued_at).toLocaleDateString("en-GB")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        <div className="rounded-2xl border border-dashed bg-muted/20 p-4">
          <p className="text-sm text-muted-foreground">
            <BookOpen className="mr-1 inline h-4 w-4 align-text-bottom" />
            Manage course content from{" "}
            <Link href="/dashboard/admin/courses" className="font-medium text-primary hover:underline">
              Courses
            </Link>{" "}
            — open the builder for any course to edit lessons and materials.
          </p>
        </div>
      </div>
    </>
  );
}
