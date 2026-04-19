/** Public bio text shown on `/c/[slug]` — Instagram-style length; line breaks preserved in UI. */

export const PROFILE_BIO_STORAGE_KEY = "commitly_profile_bio" as const;

/** Matches Instagram profile bio limit */
export const PROFILE_BIO_MAX_CHARS = 150;

export function readProfileBio(defaultBio: string): string {
  if (typeof window === "undefined") return defaultBio;
  try {
    const raw = localStorage.getItem(PROFILE_BIO_STORAGE_KEY);
    if (raw === null) return defaultBio;
    return raw.slice(0, PROFILE_BIO_MAX_CHARS);
  } catch {
    return defaultBio;
  }
}

export function writeProfileBio(bio: string): void {
  try {
    const clipped = bio.slice(0, PROFILE_BIO_MAX_CHARS);
    if (clipped.trim() === "") {
      localStorage.removeItem(PROFILE_BIO_STORAGE_KEY);
    } else {
      localStorage.setItem(PROFILE_BIO_STORAGE_KEY, clipped);
    }
  } catch {
    /* ignore quota / private mode */
  }
}
