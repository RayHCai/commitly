import Link from "next/link";

/**
 * Legacy /c/[slug] route — real links now live at /[username]/[slug].
 * This page exists only to avoid a hard 404 on old bookmarks.
 */
export default function LegacySlugPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-black">
      <p className="font-mono text-[14px] uppercase tracking-[0.14em] text-muted-foreground">
        This link has moved.
      </p>
      <Link
        href="/"
        className="text-sm underline-offset-4 hover:underline"
      >
        Go to Commitly
      </Link>
    </div>
  );
}
