/** Extract YouTube video id from common URL formats or raw id. */
export function extractYoutubeId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m =
    s.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/) ??
    s.match(/@youtube:([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? null;
}

/** Default thumbnail for a YouTube video id (may 404 for very new videos). */
export function youtubeThumbnailUrls(videoId: string): string[] {
  return [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  ];
}
