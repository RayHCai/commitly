import Link from "next/link";

import { MarketingSiteHeader } from "@/components/marketing-site-header";
import { cn } from "@/lib/utils";

type RecruiterPageHeaderProps = {
  slug: string;
  variant?: "summary" | "commits";
};

export function RecruiterPageHeader({
  slug,
  variant = "summary",
}: RecruiterPageHeaderProps) {
  const leading =
    variant === "commits" ? (
      <Link
        href={`/c/${slug}`}
        className={cn(
          "shrink-0 text-[15px] font-medium leading-none text-foreground transition-colors duration-150 hover:text-primary"
        )}
      >
        ← Back to summary
      </Link>
    ) : null;

  return <MarketingSiteHeader leading={leading} />;
}
