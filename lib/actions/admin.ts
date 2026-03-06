"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { UserRole, CoursePillar, Profile } from "@/lib/types/database";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null as never, error: "Not authenticated" };

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = data as Profile | null;
  if (profile?.role !== "admin")
    return { supabase: null as never, error: "Admin access required" };

  return { supabase, error: null };
}

// ─── User role management ───────────────────────────────────

export async function updateUserRole(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const userId = formData.get("user_id") as string;
  const role = formData.get("role") as UserRole;

  if (!userId || !["admin", "instructor", "student"].includes(role)) {
    return { error: "Invalid user ID or role" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role } as any)
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/admin");
  return { success: true };
}

// ─── Course CRUD ────────────────────────────────────────────

export async function createCourse(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const title = formData.get("title") as string;
  const pillar = formData.get("pillar") as CoursePillar;
  const description = (formData.get("description") as string) || "";

  if (!title || !pillar) return { error: "Title and pillar are required" };

  const { error } = await supabase
    .from("courses")
    .insert({ title, pillar, description } as any);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/dashboard/student");
  return { success: true };
}

export async function updateCourse(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const courseId = formData.get("course_id") as string;
  const title = formData.get("title") as string;
  const pillar = formData.get("pillar") as CoursePillar;
  const description = (formData.get("description") as string) || "";

  if (!courseId || !title || !pillar)
    return { error: "Course ID, title, and pillar are required" };

  const { error } = await supabase
    .from("courses")
    .update({ title, pillar, description } as any)
    .eq("id", courseId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/dashboard/student");
  return { success: true };
}

export async function deleteCourse(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const courseId = formData.get("course_id") as string;
  if (!courseId) return { error: "Course ID is required" };

  const { error } = await supabase
    .from("courses")
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

  const { error } = await supabase
    .from("lessons")
    .insert({
      course_id: courseId,
      title,
      content,
      order_index: orderIndex,
    } as any);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/dashboard/student");
  return { success: true };
}

export async function updateLesson(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const lessonId = formData.get("lesson_id") as string;
  const title = formData.get("title") as string;
  const content = (formData.get("content") as string) || "";
  const orderIndex = parseInt(formData.get("order_index") as string, 10) || 0;

  if (!lessonId || !title)
    return { error: "Lesson ID and title are required" };

  const { error } = await supabase
    .from("lessons")
    .update({ title, content, order_index: orderIndex } as any)
    .eq("id", lessonId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/dashboard/student");
  return { success: true };
}

export async function deleteLesson(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const lessonId = formData.get("lesson_id") as string;
  if (!lessonId) return { error: "Lesson ID is required" };

  const { error } = await supabase
    .from("lessons")
    .delete()
    .eq("id", lessonId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/dashboard/student");
  return { success: true };
}
