/**
 * Validates public Supabase env at runtime so misconfiguration fails with a clear
 * message (e.g. in Vercel logs) instead of an opaque Server Components error.
 */
export function getSupabasePublicEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment (Vercel: Project → Settings → Environment Variables), then redeploy."
    );
  }

  return { url, anonKey };
}
