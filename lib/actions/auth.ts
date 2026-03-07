"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types/database";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // Fetch the user's role to redirect to the correct dashboard
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=Something+went+wrong");
  }

  const { data } = await (supabase.from("profiles") as any)
    .select("role")
    .eq("id", user.id)
    .single();

  const role: UserRole = ((data ?? null) as { role?: UserRole } | null)?.role ?? "student";

  if (role === "admin") {
    redirect("/dashboard/admin");
  } else if (role === "instructor") {
    redirect("/dashboard/instructor");
  } else {
    redirect("/dashboard/student");
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}&tab=signup`);
  }

  redirect("/login?message=Check+your+email+to+confirm+your+account");
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
