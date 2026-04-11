"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionDbError = { message: string };

export async function markLessonVideoWatched(lessonId: string, courseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("lesson_progress" as never).upsert(
    {
      student_id: user.id,
      lesson_id: lessonId,
      video_watched_at: now,
      updated_at: now,
    } as never,
    { onConflict: "student_id,lesson_id" }
  );

  if (error) {
    return { error: (error as ActionDbError).message };
  }

  revalidatePath(`/dashboard/student/courses/${courseId}/lessons/${lessonId}`);
  revalidatePath(`/dashboard/student/courses/${courseId}`);
  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/student/progress");
  return { success: true };
}

export async function uploadSubmission(formData: FormData) {
  const supabase = await createClient();
  const submissionsTable = supabase.from("submissions" as never) as unknown as {
    insert: (
      values: Record<string, unknown>
    ) => Promise<{ error: ActionDbError | null }>;
  };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  const lessonId = formData.get("lesson_id") as string;
  const courseId = formData.get("course_id") as string | null;
  const file = formData.get("file") as File;

  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!lessonId || !uuidRe.test(lessonId)) {
    return { error: "Invalid lesson" };
  }
  if (courseId && !uuidRe.test(courseId)) {
    return { error: "Invalid course" };
  }

  if (!file || file.size === 0) {
    return { error: "Lesson and file are required" };
  }

  const maxBytes = 15 * 1024 * 1024;
  if (file.size > maxBytes) {
    return { error: "File is too large (max 15 MB)" };
  }

  const rawExt = file.name.split(".").pop() ?? "bin";
  const ext =
    /^[a-z0-9]+$/i.test(rawExt) && rawExt.length <= 8
      ? rawExt.toLowerCase()
      : "bin";
  const filePath = `${user.id}/${lessonId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("submissions")
    .upload(filePath, file);

  if (uploadError) {
    return { error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("submissions").getPublicUrl(filePath);

  const { error: insertError } = await submissionsTable.insert({
    student_id: user.id,
    lesson_id: lessonId,
    file_url: publicUrl,
    status: "pending",
  });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/student/catalog");
  revalidatePath("/dashboard/student/progress");
  if (courseId) {
    revalidatePath(`/dashboard/student/courses/${courseId}/lessons/${lessonId}`);
    revalidatePath(`/dashboard/student/courses/${courseId}`);
  }
  return { success: true };
}
