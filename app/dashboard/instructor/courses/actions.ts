"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type LooseTable = {
  select: (cols: string) => {
    eq: (col: string, val: string) => {
      single: () => Promise<{ data: unknown; error: { message: string } | null }>;
      maybeSingle: () => Promise<{ data: unknown; error: { message: string } | null }>;
      order: (col: string, opts: object) => {
        limit: (n: number) => { maybeSingle: () => Promise<{ data: unknown; error: { message: string } | null }> };
      };
    };
  };
  update: (vals: Record<string, unknown>) => {
    eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
  };
  insert: (vals: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  delete: () => { eq: (col: string, val: string) => Promise<{ error: { message: string } | null }> };
};
function loose(supabase: Awaited<ReturnType<typeof createClient>>, table: string): LooseTable {
  return supabase.from(table as never) as unknown as LooseTable;
}

// ── Permission guard ───────────────────────────────────────
async function requireCourseEditPermission() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase: null as never, error: "Not authenticated." };

  const { data } = await supabase
    .from("profiles")
    .select("role, can_edit_courses")
    .eq("id", user.id)
    .single();

  const profile = data as { role: string; can_edit_courses: boolean } | null;

  // Admins always have access; instructors need the flag
  if (profile?.role === "admin") return { supabase, error: null };
  if (profile?.role === "instructor" && profile?.can_edit_courses) return { supabase, error: null };

  return { supabase: null as never, error: "You do not have permission to edit courses. Contact an administrator." };
}

// ── Course actions ─────────────────────────────────────────

export async function updateCourseAction(formData: FormData) {
  const { supabase, error: permError } = await requireCourseEditPermission();
  if (permError) return { error: permError };

  const id          = formData.get("id") as string;
  const title       = (formData.get("title") as string).trim();
  const description = (formData.get("description") as string).trim();

  if (!id || !title) return { error: "Missing fields." };

  const { error } = await loose(supabase, "courses").update({ title, description }).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/instructor/courses/${id}`);
  revalidatePath("/dashboard/instructor/courses");
  return { success: true };
}

export async function createCourseAction(formData: FormData) {
  const { supabase, error: permError } = await requireCourseEditPermission();
  if (permError) return { error: permError };

  const title       = (formData.get("title") as string).trim();
  const pillar      = formData.get("pillar") as string;
  const description = (formData.get("description") as string).trim();

  if (!title || !pillar) return { error: "Title and pillar are required." };

  type InsertResult = { data: { id: string } | null; error: { message: string } | null };
  const { data, error } = await (supabase.from("courses" as never) as unknown as {
    insert: (v: Record<string, unknown>) => { select: (c: string) => { single: () => Promise<InsertResult> } };
  }).insert({ title, pillar, description }).select("id").single();

  if (error) return { error: error.message };
  revalidatePath("/dashboard/instructor/courses");
  return { success: true, id: data?.id };
}

// ── Lesson actions ─────────────────────────────────────────

export async function updateLessonAction(formData: FormData) {
  const { supabase, error: permError } = await requireCourseEditPermission();
  if (permError) return { error: permError };

  const id        = formData.get("id") as string;
  const courseId  = formData.get("course_id") as string;
  const title     = (formData.get("title") as string).trim();
  const content   = (formData.get("content") as string).trim();

  if (!id || !title) return { error: "Missing fields." };

  const { error } = await loose(supabase, "lessons").update({ title, content }).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/instructor/courses/${courseId}`);
  return { success: true };
}

export async function addLessonAction(formData: FormData) {
  const { supabase, error: permError } = await requireCourseEditPermission();
  if (permError) return { error: permError };

  const courseId = formData.get("course_id") as string;
  const title    = (formData.get("title") as string).trim();
  const content  = (formData.get("content") as string).trim();

  if (!courseId || !title) return { error: "Missing fields." };

  const { data: existing } = await supabase
    .from("lessons")
    .select("order_index")
    .eq("course_id", courseId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextIndex = ((existing as { order_index: number } | null)?.order_index ?? 0) + 1;

  const { error } = await loose(supabase, "lessons").insert({ course_id: courseId, title, content, order_index: nextIndex });

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/instructor/courses/${courseId}`);
  return { success: true };
}

export async function deleteLessonAction(formData: FormData) {
  const { supabase, error: permError } = await requireCourseEditPermission();
  if (permError) return { error: permError };

  const id       = formData.get("id") as string;
  const courseId = formData.get("course_id") as string;

  if (!id) return { error: "Missing lesson ID." };

  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/dashboard/instructor/courses/${courseId}`);
  return { success: true };
}

export async function reorderLessonsAction(formData: FormData) {
  const { supabase, error: permError } = await requireCourseEditPermission();
  if (permError) return { error: permError };

  const courseId = formData.get("course_id") as string;
  const idsJson  = formData.get("ordered_ids") as string;
  const ids: string[] = JSON.parse(idsJson);

  const updates = ids.map((id, idx) =>
    loose(supabase, "lessons").update({ order_index: idx + 1 }).eq("id", id)
  );
  await Promise.all(updates);
  revalidatePath(`/dashboard/instructor/courses/${courseId}`);
  return { success: true };
}
