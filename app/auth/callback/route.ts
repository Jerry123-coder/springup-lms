import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { safeAppRedirectPath } from "@/lib/safe-redirect";
import type { Database, UserRole } from "@/lib/types/database";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const origin = url.origin;

  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`
      );
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const safeNext = safeAppRedirectPath(next, origin);
  if (safeNext) {
    return NextResponse.redirect(`${origin}${safeNext}`);
  }

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role: UserRole =
    ((data ?? null) as { role?: UserRole } | null)?.role ?? "student";

  if (role === "admin") {
    return NextResponse.redirect(`${origin}/dashboard/admin`);
  }
  if (role === "instructor") {
    return NextResponse.redirect(`${origin}/dashboard/instructor`);
  }
  return NextResponse.redirect(`${origin}/dashboard/student`);
}
