"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { safeAppRedirectPath } from "@/lib/safe-redirect";
import type { UserRole } from "@/lib/types/database";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next = formData.get("next") as string | null;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const nextParam = next ? `&next=${encodeURIComponent(next)}` : "";
    redirect(`/login?error=${encodeURIComponent(error.message)}${nextParam}`);
  }

  // Fetch the user's role to redirect to the correct dashboard
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=Something+went+wrong");
  }

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role: UserRole = ((data ?? null) as { role?: UserRole } | null)?.role ?? "student";

  const safeNext = safeAppRedirectPath(next, getSiteUrl());
  if (safeNext) {
    redirect(safeNext);
  }

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
  const next = formData.get("next") as string | null;

  const siteUrl = getSiteUrl();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    const nextParam = next ? `&next=${encodeURIComponent(next)}` : "";
    redirect(`/login?error=${encodeURIComponent(error.message)}&tab=signup${nextParam}`);
  }

  redirect("/login?message=Check+your+email+to+confirm+your+account");
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();
  const email = (formData.get("email") as string)?.trim();
  if (!email) {
    redirect("/login/forgot-password?error=" + encodeURIComponent("Email is required"));
  }

  const siteUrl = getSiteUrl();
  // Full callback URL + next + purpose so recovery survives Supabase redirects; add this URL to
  // Supabase → Auth → URL Configuration → Redirect allow list (incl. http://localhost:3000/auth/callback).
  const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent("/login/update-password")}&purpose=recovery`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    redirect(
      `/login/forgot-password?error=${encodeURIComponent(error.message)}`
    );
  }

  redirect(
    "/login/forgot-password?message=" +
      encodeURIComponent(
        "Check your email for a password reset link. If it does not arrive in a few minutes, check your spam folder."
      )
  );
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm_password") as string;

  if (!password || password.length < 6) {
    redirect(
      "/login/update-password?error=" +
        encodeURIComponent("Password must be at least 6 characters")
    );
  }
  if (password !== confirm) {
    redirect(
      "/login/update-password?error=" + encodeURIComponent("Passwords do not match")
    );
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(
      "/login/update-password?error=" + encodeURIComponent(error.message)
    );
  }

  redirect("/login?message=" + encodeURIComponent("Your password has been updated. Sign in with your new password."));
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
