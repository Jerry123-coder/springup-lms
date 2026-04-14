"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * If the email link lands on `/` with `?code=` (Supabase Site URL fallback),
 * forward to `/auth/callback` with the same query so the code can be exchanged.
 * Middleware usually does this server-side; this is a client safety net.
 */
function AuthCodeRedirectInner() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname !== "/") return;
    const code = searchParams.get("code");
    if (!code) return;
    const q = searchParams.toString();
    router.replace(`/auth/callback?${q}`);
  }, [pathname, router, searchParams]);

  return null;
}

export function AuthCodeRedirect() {
  return (
    <Suspense fallback={null}>
      <AuthCodeRedirectInner />
    </Suspense>
  );
}
