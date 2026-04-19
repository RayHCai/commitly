/** Canonical site URL for metadata and OG (set in production via env). */
export function siteUrl(): URL {
  const raw =
    typeof process.env.NEXT_PUBLIC_SITE_URL === "string" &&
    process.env.NEXT_PUBLIC_SITE_URL.trim()
      ? process.env.NEXT_PUBLIC_SITE_URL.trim()
      : "http://localhost:3000";
  try {
    return new URL(raw.endsWith("/") ? raw.slice(0, -1) : raw);
  } catch {
    return new URL("http://localhost:3000");
  }
}
