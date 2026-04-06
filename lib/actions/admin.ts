"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { UserRole, CourseCategory, CoursePillar, Profile } from "@/lib/types/database";

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
  const table = (name: string) =>
    supabase.from(name as never) as unknown as LooseTable;

  const courseId = formData.get("course_id") as string;
  const title = formData.get("title") as string;
  const content = (formData.get("content") as string) || "";
  const orderIndex = parseInt(formData.get("order_index") as string, 10) || 0;

  if (!courseId || !title)
    return { error: "Course ID and title are required" };

  const { error } = await table("lessons").insert({
    course_id: courseId,
    title,
    content,
    order_index: orderIndex,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/courses");
  revalidatePath(`/dashboard/admin/courses/${courseId}`);
  revalidatePath("/dashboard/student");
  return { success: true };
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

export async function adminCreateCohort(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };
  const table = (name: string) =>
    supabase.from(name as never) as unknown as LooseTable;

  const name = formData.get("name") as string;
  const instructorId = formData.get("instructor_id") as string;
  const description = (formData.get("description") as string) || "";

  if (!name || !instructorId) return { error: "Name and instructor are required" };

  const { error } = await table("cohorts")
    .insert({ name, instructor_id: instructorId, description });

  if (error) return { error: error.message };

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

export async function adminUpdateCohortInstructor(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };
  const table = (name: string) =>
    supabase.from(name as never) as unknown as LooseTable;

  const cohortId = formData.get("cohort_id") as string;
  const instructorId = formData.get("instructor_id") as string;

  if (!cohortId || !instructorId) return { error: "Cohort and instructor IDs are required" };

  const { error } = await table("cohorts")
    .update({ instructor_id: instructorId })
    .eq("id", cohortId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/cohorts");
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
