"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types/database";

export async function gradeSubmission(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const profile = data as { role?: UserRole } | null;
  if (!profile || (profile.role !== "instructor" && profile.role !== "admin")) {
    return { error: "Only instructors can grade submissions" };
  }

  const submissionId = formData.get("submission_id") as string;
  const grade = parseInt(formData.get("grade") as string, 10);
  const feedback = (formData.get("feedback") as string) || "";

  if (!submissionId || isNaN(grade) || grade < 0 || grade > 100) {
    return { error: "Valid submission ID and grade (0-100) are required" };
  }

  const { error } = await supabase
    .from("submissions")
    .update({ grade, feedback, status: "reviewed" })
    .eq("id", submissionId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/instructor");
  revalidatePath("/dashboard/instructor/reviews");
  return { success: true };
}
