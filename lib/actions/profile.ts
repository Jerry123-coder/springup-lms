"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ProfileUpdate } from "@/lib/types/database";

export async function updateProfileName(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const fullName = (formData.get("full_name") as string)?.trim();
  if (!fullName) return { error: "Name is required" };

  const patch: ProfileUpdate = { full_name: fullName };
  const { data: updatedRow, error } = await supabase
    .from("profiles")
    .update(patch as never)
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!updatedRow) {
    return {
      error:
        "Could not save your name — no row was updated. Check that you are signed in, or ask an admin to run the latest database migrations (profiles RLS).",
    };
  }

  const { error: metaErr } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  });
  if (metaErr) {
    return {
      error: `${metaErr.message} Your name was saved in the directory; try refreshing the page.`,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/instructor/profile");
  revalidatePath("/dashboard/admin/profile");
  revalidatePath("/dashboard/student/profile");
  return { success: true };
}

export async function updateProfileEmail(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { error: "Email is required" };

  const { error: authErr } = await supabase.auth.updateUser({ email });

  if (authErr) return { error: authErr.message };

  const emailPatch: ProfileUpdate = { email };
  const { data: updatedRow, error: profErr } = await supabase
    .from("profiles")
    .update(emailPatch as never)
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (profErr) return { error: profErr.message };
  if (!updatedRow) {
    return {
      error:
        "Could not update your profile email. You may need the latest database migration for profile updates, or an admin should check Row Level Security on `profiles`.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/instructor/profile");
  revalidatePath("/dashboard/admin/profile");
  revalidatePath("/dashboard/student/profile");
  return {
    success: true,
    message:
      "Check your new inbox to confirm the email change. Until then, your previous email still works.",
  };
}
