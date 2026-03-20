"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionDbError = { message: string };

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
  const file = formData.get("file") as File;

  if (!lessonId || !file || file.size === 0) {
    return { error: "Lesson and file are required" };
  }

  const ext = file.name.split(".").pop();
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
  return { success: true };
}
