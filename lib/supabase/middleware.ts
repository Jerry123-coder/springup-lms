import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // PKCE email/OAuth: Supabase redirects here with ?code=... — exchange on dedicated route
  const code = request.nextUrl.searchParams.get("code");
  if (code && !pathname.startsWith("/auth/callback")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  // Protect all /dashboard routes — redirect unauthenticated users to login
  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Role-based dashboard areas (matches BLUEPRINT RBAC)
  if (user && pathname.startsWith("/dashboard")) {
    const sharedPaths = ["/dashboard/tutorials"];
    const isSharedRoute = sharedPaths.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    );
    if (!isSharedRoute) {
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const profile = profileRow as { role?: "admin" | "instructor" | "student" } | null;
      const role = profile?.role ?? "student";

      const home =
        role === "admin"
          ? "/dashboard/admin"
          : role === "instructor"
            ? "/dashboard/instructor"
            : "/dashboard/student";

      if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
        return NextResponse.redirect(new URL(home, request.url));
      }
      if (pathname.startsWith("/dashboard/instructor") && role !== "instructor") {
        return NextResponse.redirect(new URL(home, request.url));
      }
      if (pathname.startsWith("/dashboard/student") && role !== "student") {
        return NextResponse.redirect(new URL(home, request.url));
      }
    }
  }

  // Redirect authenticated users away from login page
  if (pathname === "/login" && user) {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const profile = data as { role?: "admin" | "instructor" | "student" } | null;
    const role = profile?.role ?? "student";
    const url = request.nextUrl.clone();

    if (role === "admin") {
      url.pathname = "/dashboard/admin";
    } else if (role === "instructor") {
      url.pathname = "/dashboard/instructor";
    } else {
      url.pathname = "/dashboard/student";
    }

    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
