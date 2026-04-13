"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/site-url";
import type {
  UserRole,
  CourseCategory,
  CoursePillar,
  Profile,
  LessonMaterialKind,
} from "@/lib/types/database";

type ActionDbError = { message: string };
type EqResult = Promise<{ error: ActionDbError | null }>;
type SingleResult = Promise<{ data: unknown; error: ActionDbError | null }>;
type InsertResult = Promise<{ error: ActionDbError | null }>;

type LooseTable = {
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      single: () => SingleResult;
    };
  };
  update: (values: Record<string, unknown>) => {
    eq: (column: string, value: string) => EqResult;
  };
  insert: (values: Record<string, unknown>) => InsertResult;
  delete: () => {
    eq: (column: string, value: string) => EqResult;
  };
};

async function requireAdmin() {
  const supabase = await createClient();
  const table = (name: string) =>
    supabase.from(name as never) as unknown as LooseTable;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null as never, error: "Not authenticated" };

  const { data } = await table("profiles").select("*").eq("id", user.id).single();

  const profile = data as Profile | null;
  if (profile?.role !== "admin")
    return { supabase: null as never, error: "Admin access required" };

  return { supabase, error: null };
}

// ─── User role management ───────────────────────────────────

export async function updateUserRole(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };
  const table = (name: string) =>
    supabase.from(name as never) as unknown as LooseTable;

  const userId = formData.get("user_id") as string;
  const role = formData.get("role") as UserRole;

  if (!userId || !["admin", "instructor", "student"].includes(role)) {
    return { error: "Invalid user ID or role" };
  }

  const { error } = await table("profiles").update({ role }).eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/admin");
  return { success: true };
}

export async function setStudentInstructor(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };
  const table = (name: string) =>
    supabase.from(name as never) as unknown as LooseTable;

  const studentId = formData.get("student_id") as string;
  const instructorId = (formData.get("instructor_id") as string | null)?.trim() ?? "";

  if (!studentId) return { error: "Student is required" };

  const { error: delErr } = await table("instructor_student_assignments")
    .delete()
    .eq("student_id", studentId);

  if (delErr) return { error: delErr.message };

  if (instructorId) {
    const { error: insErr } = await table("instructor_student_assignments").insert({
      instructor_id: instructorId,
      student_id: studentId,
    });
    if (insErr) return { error: insErr.message };
  }

  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/instructor");
  return { success: true };
}

// ─── Course CRUD ────────────────────────────────────────────

export async function createCourse(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const title = formData.get("title") as string;
  const pillar = formData.get("pillar") as CoursePillar;
  const category = (formData.get("category") as CourseCategory) || "Other";
  const description = (formData.get("description") as string) || "";

  if (!title || !pillar) return { error: "Title and pillar are required" };

  type CourseInsertResult = { data: { id: string } | null; error: { message: string } | null };
  const { data, error } = await (supabase.from("courses" as never) as unknown as {
    insert: (v: Record<string, unknown>) => {
      select: (cols: string) => { single: () => Promise<CourseInsertResult> };
    };
  })
    .insert({ title, pillar, category, description })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/dashboard/student");
  return { success: true, id: data?.id };
}

export async function updateCourse(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };
  const table = (name: string) =>
    supabase.from(name as never) as unknown as LooseTable;

  const courseId = formData.get("course_id") as string;
  const title = formData.get("title") as string;
  const pillar = formData.get("pillar") as CoursePillar;
  const category = (formData.get("category") as CourseCategory) || "Other";
  const description = (formData.get("description") as string) || "";

  if (!courseId || !title || !pillar)
    return { error: "Course ID, title, and pillar are required" };

  const { error } = await table("courses")
    .update({ title, pillar, category, description })
    .eq("id", courseId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/dashboard/student");
  return { success: true };
}

export async function deleteCourse(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };
  const table = (name: string) =>
    supabase.from(name as never) as unknown as LooseTable;

  const courseId = formData.get("course_id") as string;
  if (!courseId) return { error: "Course ID is required" };

  const { error } = await table("courses")
    .delete()
    .eq("id", courseId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/dashboard/student");
  return { success: true };
}

// ─── Lesson CRUD ────────────────────────────────────────────

export async function createLesson(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const courseId = formData.get("course_id") as string;
  const title = formData.get("title") as string;
  const content = (formData.get("content") as string) || "";
  const orderIndex = parseInt(formData.get("order_index") as string, 10) || 0;

  if (!courseId || !title)
    return { error: "Course ID and title are required" };

  const { data: row, error } = await supabase
    .from("lessons" as never)
    .insert({
      course_id: courseId,
      title,
      content,
      order_index: orderIndex,
    } as never)
    .select("id, course_id, title, content, order_index, created_at")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/courses");
  revalidatePath(`/dashboard/admin/courses/${courseId}`);
  revalidatePath("/dashboard/student");
  return { success: true, lesson: row };
}

// ─── Pillar settings ─────────────────────────────────────────

export async function updatePillarSettings(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };
  const table = (name: string) =>
    supabase.from(name as never) as unknown as LooseTable;

  const slug        = formData.get("slug") as string;
  const description = (formData.get("description") as string) || "";
  const subtitle    = (formData.get("subtitle") as string) || "";

  if (!slug) return { error: "Pillar slug is required" };

  const { error } = await table("pillar_settings")
    .update({ description, subtitle, updated_at: new Date().toISOString() })
    .eq("slug", slug);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/dashboard/student");
  return { success: true };
}

// ─── Reorder lessons ─────────────────────────────────────────

export async function reorderLessons(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const courseId   = formData.get("course_id") as string;
  const orderedIds = JSON.parse(formData.get("ordered_ids") as string) as string[];

  const updates = orderedIds.map((id, idx) =>
    supabase
      .from("lessons" as never)
      .update({ order_index: idx + 1 } as never)
      .eq("id" as never, id as never)
  );
  await Promise.all(updates);

  revalidatePath(`/dashboard/admin/courses/${courseId}`);
  revalidatePath("/dashboard/admin/courses");
  return { success: true };
}

export async function updateLesson(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };
  const table = (name: string) =>
    supabase.from(name as never) as unknown as LooseTable;

  const lessonId = formData.get("lesson_id") as string;
  const courseId = (formData.get("course_id") as string) || "";
  const title = formData.get("title") as string;
  const content = (formData.get("content") as string) || "";
  const orderIndex = parseInt(formData.get("order_index") as string, 10) || 0;

  if (!lessonId || !title)
    return { error: "Lesson ID and title are required" };

  const { error } = await table("lessons")
    .update({ title, content, order_index: orderIndex })
    .eq("id", lessonId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/courses");
  if (courseId) revalidatePath(`/dashboard/admin/courses/${courseId}`);
  revalidatePath("/dashboard/student");
  return { success: true };
}

export async function deleteLesson(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };
  const table = (name: string) =>
    supabase.from(name as never) as unknown as LooseTable;

  const lessonId = formData.get("lesson_id") as string;
  if (!lessonId) return { error: "Lesson ID is required" };

  const { error } = await table("lessons")
    .delete()
    .eq("id", lessonId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/dashboard/student");
  return { success: true };
}

function revalidateCourseAndStudent(courseId: string) {
  revalidatePath("/dashboard/admin/courses");
  revalidatePath(`/dashboard/admin/courses/${courseId}`);
  revalidatePath("/dashboard/student");
}

// ─── Lesson materials (links, files, extra videos) ──────────

export async function addLessonMaterial(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };
  const table = (name: string) =>
    supabase.from(name as never) as unknown as LooseTable;

  const lessonId = formData.get("lesson_id") as string;
  const courseId = formData.get("course_id") as string;
  const title = (formData.get("title") as string)?.trim();
  const kind = (formData.get("kind") as LessonMaterialKind) || "link";
  const url = (formData.get("url") as string)?.trim();
  const thumbnailUrl = (formData.get("thumbnail_url") as string)?.trim() || null;
  const orderIndex = parseInt(formData.get("order_index") as string, 10) || 0;

  if (!lessonId || !courseId || !title || !url)
    return { error: "Title, URL, lesson, and course are required" };

  const { error } = await table("lesson_materials").insert({
    lesson_id: lessonId,
    title,
    kind,
    url,
    thumbnail_url: thumbnailUrl,
    order_index: orderIndex,
  });

  if (error) return { error: error.message };
  revalidateCourseAndStudent(courseId);
  return { success: true };
}

export async function updateLessonMaterial(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };
  const table = (name: string) =>
    supabase.from(name as never) as unknown as LooseTable;

  const id = formData.get("id") as string;
  const courseId = formData.get("course_id") as string;
  const title = (formData.get("title") as string)?.trim();
  const kind = (formData.get("kind") as LessonMaterialKind) || "link";
  const url = (formData.get("url") as string)?.trim();
  const thumbnailUrl = (formData.get("thumbnail_url") as string)?.trim() || null;
  const orderIndex = parseInt(formData.get("order_index") as string, 10) || 0;

  if (!id || !courseId || !title || !url)
    return { error: "Material id, title, URL, and course are required" };

  const { error } = await table("lesson_materials")
    .update({
      title,
      kind,
      url,
      thumbnail_url: thumbnailUrl,
      order_index: orderIndex,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidateCourseAndStudent(courseId);
  return { success: true };
}

export async function deleteLessonMaterial(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };
  const table = (name: string) =>
    supabase.from(name as never) as unknown as LooseTable;

  const id = formData.get("id") as string;
  const courseId = formData.get("course_id") as string;
  if (!id || !courseId) return { error: "Material id and course are required" };

  const { error } = await table("lesson_materials").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidateCourseAndStudent(courseId);
  return { success: true };
}

// ─── Instructor permission management ───────────────────────

export async function toggleInstructorCoursePermission(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };
  const table = (name: string) =>
    supabase.from(name as never) as unknown as LooseTable;

  const instructorId = formData.get("instructor_id") as string;
  const value = formData.get("value") === "true";

  if (!instructorId) return { error: "Instructor ID is required" };

  const { error } = await table("profiles")
    .update({ can_edit_courses: value })
    .eq("id", instructorId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/instructors");
  revalidatePath("/dashboard/instructor/courses");
  return { success: true };
}

// ─── Cohort management (admin) ───────────────────────────────

function parseUuidListJson(raw: string | null): string[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    const out: string[] = [];
    const seen = new Set<string>();
    for (const x of v) {
      if (typeof x === "string" && x.length > 0 && !seen.has(x)) {
        seen.add(x);
        out.push(x);
      }
    }
    return out;
  } catch {
    return [];
  }
}

async function assertAllRoleInstructor(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  ids: string[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (ids.length === 0) return { ok: false, error: "At least one instructor is required" };
  type Row = { id: string; role: string };
  const { data, error } = await supabase
    .from("profiles" as never)
    .select("id, role")
    .in("id", ids);
  if (error) return { ok: false, error: error.message };
  const rows = (data ?? []) as Row[];
  if (rows.length !== ids.length)
    return { ok: false, error: "One or more instructors are invalid" };
  if (!rows.every((r) => r.role === "instructor"))
    return { ok: false, error: "All assigned users must be instructors" };
  return { ok: true };
}

export async function adminCreateCohort(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const name = (formData.get("name") as string)?.trim();
  const description = ((formData.get("description") as string) || "").trim();
  let instructorIds = parseUuidListJson(formData.get("instructor_ids") as string | null);
  if (instructorIds.length === 0) {
    const single = (formData.get("instructor_id") as string | null)?.trim();
    if (single) instructorIds = [single];
  }

  if (!name) return { error: "Name is required" };

  const check = await assertAllRoleInstructor(supabase, instructorIds);
  if (!check.ok) return { error: check.error };

  const primaryId = instructorIds[0];

  type CohortInsert = {
    insert: (v: Record<string, unknown>) => {
      select: (cols: string) => { single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }> };
    };
  };
  const { data: cohortRow, error: insErr } = await (
    supabase.from("cohorts" as never) as unknown as CohortInsert
  )
    .insert({ name, instructor_id: primaryId, description: description || null })
    .select("id")
    .single();

  if (insErr) return { error: insErr.message };
  const cohortId = cohortRow?.id;
  if (!cohortId) return { error: "Failed to create cohort" };

  const ciRows = instructorIds.map((instructor_id) => ({
    cohort_id: cohortId,
    instructor_id,
  }));
  const { error: ciErr } = await supabase.from("cohort_instructors" as never).insert(ciRows as never);
  if (ciErr) return { error: ciErr.message };

  revalidatePath("/dashboard/admin/cohorts");
  revalidatePath("/dashboard/instructor/cohorts");
  return { success: true };
}

export async function adminDeleteCohort(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };
  const table = (name: string) =>
    supabase.from(name as never) as unknown as LooseTable;

  const cohortId = formData.get("cohort_id") as string;
  if (!cohortId) return { error: "Cohort ID is required" };

  const { error } = await table("cohorts")
    .delete()
    .eq("id", cohortId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/cohorts");
  revalidatePath("/dashboard/instructor/cohorts");
  return { success: true };
}

/** Replace the full instructor list; first id becomes cohorts.instructor_id (primary). */
export async function adminSetCohortInstructors(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };
  const table = (name: string) =>
    supabase.from(name as never) as unknown as LooseTable;

  const cohortId = formData.get("cohort_id") as string;
  const instructorIds = parseUuidListJson(formData.get("instructor_ids") as string | null);

  if (!cohortId) return { error: "Cohort ID is required" };

  const check = await assertAllRoleInstructor(supabase, instructorIds);
  if (!check.ok) return { error: check.error };

  const primaryId = instructorIds[0];

  const { error: upErr } = await table("cohorts")
    .update({ instructor_id: primaryId })
    .eq("id", cohortId);
  if (upErr) return { error: upErr.message };

  type DelCi = {
    delete: () => { eq: (c: string, v: string) => Promise<{ error: { message: string } | null }> };
  };
  const { error: delErr } = await (
    supabase.from("cohort_instructors" as never) as unknown as DelCi
  )
    .delete()
    .eq("cohort_id", cohortId);
  if (delErr) return { error: delErr.message };

  const ciRows = instructorIds.map((instructor_id) => ({ cohort_id: cohortId, instructor_id }));
  const { error: ciErr } = await supabase.from("cohort_instructors" as never).insert(ciRows as never);
  if (ciErr) return { error: ciErr.message };

  revalidatePath("/dashboard/admin/cohorts");
  revalidatePath("/dashboard/instructor/cohorts");
  return { success: true };
}

export async function adminAddStudentToCohort(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };
  const table = (name: string) =>
    supabase.from(name as never) as unknown as LooseTable;

  const cohortId = formData.get("cohort_id") as string;
  const studentId = formData.get("student_id") as string;

  if (!cohortId || !studentId) return { error: "Cohort and student IDs are required" };

  const { error } = await table("cohort_students")
    .insert({ cohort_id: cohortId, student_id: studentId });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/cohorts");
  revalidatePath("/dashboard/admin/students");
  return { success: true };
}

export async function adminAddStudentsToCohortBulk(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const cohortId = formData.get("cohort_id") as string;
  const studentIds = parseUuidListJson(formData.get("student_ids") as string | null);

  if (!cohortId) return { error: "Cohort ID is required" };
  if (studentIds.length === 0) return { error: "Select at least one student" };

  type Row = { id: string; role: string };
  const { data: profs, error: pErr } = await supabase
    .from("profiles" as never)
    .select("id, role")
    .in("id", studentIds);
  if (pErr) return { error: pErr.message };
  const rows = (profs ?? []) as Row[];
  if (rows.length !== studentIds.length)
    return { error: "One or more students are invalid" };
  if (!rows.every((r) => r.role === "student"))
    return { error: "All selected users must be students" };

  const { data: existing, error: exErr } = await supabase
    .from("cohort_students" as never)
    .select("student_id")
    .eq("cohort_id", cohortId)
    .in("student_id", studentIds);
  if (exErr) return { error: exErr.message };

  const already = new Set(
    ((existing ?? []) as { student_id: string }[]).map((r) => r.student_id)
  );
  const toAdd = studentIds.filter((id) => !already.has(id));
  if (toAdd.length === 0) {
    revalidatePath("/dashboard/admin/cohorts");
    revalidatePath("/dashboard/admin/students");
    return { success: true, added: 0 };
  }

  const insertRows = toAdd.map((student_id) => ({ cohort_id: cohortId, student_id }));
  const { error: insErr } = await supabase
    .from("cohort_students" as never)
    .insert(insertRows as never);
  if (insErr) return { error: insErr.message };

  revalidatePath("/dashboard/admin/cohorts");
  revalidatePath("/dashboard/admin/students");
  return { success: true, added: toAdd.length };
}

export async function adminRemoveStudentFromCohort(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const cohortId = formData.get("cohort_id") as string;
  const studentId = formData.get("student_id") as string;

  if (!cohortId || !studentId) return { error: "Cohort and student IDs are required" };

  // Use a cast that supports two chained .eq() filters on delete
  type TwoEqDelete = {
    delete: () => {
      eq: (col: string, val: string) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
      };
    };
  };

  const { error } = await (
    supabase.from("cohort_students" as never) as unknown as TwoEqDelete
  ).delete().eq("cohort_id", cohortId).eq("student_id", studentId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/cohorts");
  revalidatePath("/dashboard/admin/students");
  return { success: true };
}

// ─── Auth admin (service role) — invite / delete users ───────

export async function adminInviteUser(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const fullName = (formData.get("full_name") as string)?.trim() ?? "";
  const role = formData.get("role") as UserRole;

  if (!email) return { error: "Email is required" };
  if (!["student", "instructor", "admin"].includes(role)) {
    return { error: "Invalid role" };
  }

  let adminClient: ReturnType<typeof createAdminClient>;
  try {
    adminClient = createAdminClient();
  } catch {
    return {
      error:
        "Invite is not configured. Add SUPABASE_SERVICE_ROLE_KEY to your server environment.",
    };
  }

  const siteUrl = getSiteUrl();
  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
    redirectTo: `${siteUrl}/auth/callback`,
  });

  if (error) return { error: error.message };

  const userId = data.user?.id;
  if (userId) {
    const table = (name: string) =>
      supabase.from(name as never) as unknown as LooseTable;
    const { error: upErr } = await table("profiles")
      .update({ role, full_name: fullName || email.split("@")[0] })
      .eq("id", userId);
    if (upErr) return { error: upErr.message };
  }

  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/admin/students");
  revalidatePath("/dashboard/admin/instructors");
  return { success: true };
}

export async function adminDeleteUser(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const {
    data: { user: current },
  } = await supabase.auth.getUser();
  const userId = formData.get("user_id") as string;
  if (!userId) return { error: "User ID is required" };
  if (current?.id === userId) {
    return { error: "You cannot delete your own account" };
  }

  let adminClient: ReturnType<typeof createAdminClient>;
  try {
    adminClient = createAdminClient();
  } catch {
    return {
      error:
        "Delete is not configured. Add SUPABASE_SERVICE_ROLE_KEY to your server environment.",
    };
  }

  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/admin/students");
  revalidatePath("/dashboard/admin/instructors");
  revalidatePath("/dashboard/admin");
  return { success: true };
}

export async function adminUpdateUserProfile(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const userId = formData.get("user_id") as string;
  const fullName = (formData.get("full_name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!userId || !fullName) return { error: "User and full name are required" };
  if (!email) return { error: "Email is required" };

  const table = (name: string) =>
    supabase.from(name as never) as unknown as LooseTable;
  const { error: pErr } = await table("profiles")
    .update({ full_name: fullName, email })
    .eq("id", userId);
  if (pErr) return { error: pErr.message };

  let adminClient: ReturnType<typeof createAdminClient>;
  try {
    adminClient = createAdminClient();
  } catch {
    return { error: "Service role key missing — profile row updated; auth email not synced." };
  }

  const { error: aErr } = await adminClient.auth.admin.updateUserById(userId, {
    email,
    user_metadata: { full_name: fullName },
  });
  if (aErr) return { error: aErr.message };

  revalidatePath("/dashboard/admin/users");
  revalidatePath(`/dashboard/admin/users/${userId}`);
  return { success: true };
}
