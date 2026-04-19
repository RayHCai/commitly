"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { mockUser } from "@/lib/mockData";
import {
  PROFILE_BIO_MAX_CHARS,
  readProfileBio,
  writeProfileBio,
} from "@/lib/profile-bio-storage";
import { cn } from "@/lib/utils";

export default function DashboardProfilePage() {
  const defaultBio = mockUser.tagline;
  const [text, setText] = React.useState(defaultBio);
  const [savedFlash, setSavedFlash] = React.useState(false);

  React.useEffect(() => {
    setText(readProfileBio(defaultBio));
  }, [defaultBio]);

  const remaining = PROFILE_BIO_MAX_CHARS - text.length;

  function save() {
    writeProfileBio(text);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  }

  function resetToDefault() {
    writeProfileBio("");
    setText(defaultBio);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  }

  return (
    <div className="mx-auto max-w-[1080px]">
      <section>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Profile
        </p>
        <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight text-foreground md:text-4xl">
          Public bio
        </h1>
        <p className="mt-4 max-w-2xl text-[color:var(--text-secondary)]">
          This text appears under your name on shared candidate links. Use line breaks
          and emoji like an Instagram bio—visitors see the same layout.
        </p>

        <div className="mt-10 max-w-xl">
          <label htmlFor="profile-bio" className="text-sm font-medium text-foreground">
            Bio
          </label>
          <textarea
            id="profile-bio"
            name="bio"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, PROFILE_BIO_MAX_CHARS))}
            spellCheck
            className="mt-2 min-h-[7.5rem] w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 md:text-sm"
            aria-describedby="profile-bio-hint"
            placeholder="Building something…"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span id="profile-bio-hint">
              {PROFILE_BIO_MAX_CHARS} characters max · line breaks preserved
            </span>
            <span className={cn(remaining < 20 && "text-amber-700 dark:text-amber-500")}>
              {text.length}/{PROFILE_BIO_MAX_CHARS}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" onClick={save}>
              Save bio
            </Button>
            <Button type="button" variant="outline" onClick={resetToDefault}>
              Use default
            </Button>
          </div>
          {savedFlash ? (
            <p className="mt-3 text-sm text-primary" role="status">
              Saved.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
