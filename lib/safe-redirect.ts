/**
 * Validates relative `next` targets for post-auth redirects: must resolve to the same
 * origin as `baseUrl`, and path must start with /dashboard or /login (blocks open redirects).
 */
export function safeAppRedirectPath(
  next: string | null | undefined,
  baseUrl: string
): string | null {
  if (!next || typeof next !== "string") return null;
  const t = next.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return null;
  try {
    const base = new URL(baseUrl);
    const resolved = new URL(t, base);
    if (resolved.origin !== base.origin) return null;
    const path = resolved.pathname + resolved.search;
    if (!path.startsWith("/dashboard") && !path.startsWith("/login")) {
      return null;
    }
    return path;
  } catch {
    return null;
  }
}
