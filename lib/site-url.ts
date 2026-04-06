/**
 * Public site origin for redirects (email links, OAuth, etc.).
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://your-app.vercel.app).
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
