"use client";

import * as React from "react";

import { readProfileBio } from "@/lib/profile-bio-storage";
import { cn } from "@/lib/utils";

/** Renders the saved public bio with line breaks; syncs from localStorage after mount. */
export function CandidateProfileBio({
  defaultBio,
  className,
}: {
  defaultBio: string;
  className?: string;
}) {
  const [bio, setBio] = React.useState(defaultBio);

  React.useEffect(() => {
    setBio(readProfileBio(defaultBio));
  }, [defaultBio]);

  return (
    <p className={cn("whitespace-pre-wrap text-base leading-relaxed text-foreground", className)}>
      {bio}
    </p>
  );
}
