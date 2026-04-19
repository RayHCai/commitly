"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const TOKEN_KEY = "commitly_token";

function getTokenPayload(): { username?: string } | null {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function isCompleteUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function DashboardHeader() {
  const router = useRouter();
  const [username, setUsername] = React.useState<string | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const submittedRef = React.useRef(false);

  const [linkedinModalOpen, setLinkedinModalOpen] = React.useState(false);
  const [linkedinUrl, setLinkedinUrl] = React.useState("");
  const [linkedinSubmitting, setLinkedinSubmitting] = React.useState(false);
  const linkedinInputRef = React.useRef<HTMLInputElement>(null);
  const linkedinSubmittedRef = React.useRef(false);

  React.useEffect(() => {
    const payload = getTokenPayload();
    setUsername(payload?.username ?? null);
  }, []);

  React.useEffect(() => {
    if (modalOpen) {
      submittedRef.current = false;
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setUrl("");
    }
  }, [modalOpen]);

  React.useEffect(() => {
    if (!modalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setModalOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  React.useEffect(() => {
    if (linkedinModalOpen) {
      linkedinSubmittedRef.current = false;
      setTimeout(() => linkedinInputRef.current?.focus(), 0);
    } else {
      setLinkedinUrl("");
    }
  }, [linkedinModalOpen]);

  React.useEffect(() => {
    if (!linkedinModalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLinkedinModalOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [linkedinModalOpen]);

  async function submitLinkedin(value: string) {
    if (linkedinSubmittedRef.current) return;
    linkedinSubmittedRef.current = true;
    setLinkedinSubmitting(true);
    try {
      await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ linkedinUrl: value }),
      });
      setLinkedinModalOpen(false);
      toast.success("LinkedIn saved.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLinkedinSubmitting(false);
      linkedinSubmittedRef.current = false;
    }
  }

  function handleLinkedinSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = linkedinUrl.trim();
    if (!trimmed) {
      toast.error("Please enter your LinkedIn URL.");
      return;
    }
    if (!isCompleteUrl(trimmed)) {
      toast.error("Enter a valid URL starting with https://");
      return;
    }
    submitLinkedin(trimmed);
  }

  function handleLinkedinChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setLinkedinUrl(value);
    if (isCompleteUrl(value.trim())) {
      submitLinkedin(value.trim());
    }
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    try {
      const { data } = await apiFetch<{ data: { uploadUrl: string; s3Key: string } }>(
        "/users/me/resume/presigned-url",
        {
          method: "POST",
          body: JSON.stringify({ fileName: file.name, contentType: file.type }),
        }
      );
      const s3Res = await fetch(data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!s3Res.ok) throw new Error(`S3 upload failed: ${s3Res.status}`);
      await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ resumeS3Key: data.s3Key }),
      });
      toast.success("Resume uploaded.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function submit(value: string) {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);

    try {
      const res = await apiFetch<{ data: { id: string; taskId: string | null } }>("/links", {
        method: "POST",
        body: JSON.stringify({ url: value }),
      });
      setModalOpen(false);
      const { id: linkId, taskId } = res.data;
      const query = new URLSearchParams();
      if (taskId) query.set("taskId", taskId);
      if (linkId) query.set("linkId", linkId);
      router.push(`/generating?${query.toString()}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
      submittedRef.current = false;
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error("Please enter a job posting URL.");
      return;
    }
    if (!isCompleteUrl(trimmed)) {
      toast.error("Enter a valid URL starting with https://");
      return;
    }
    submit(trimmed);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUrl(value);
    if (isCompleteUrl(value.trim())) {
      submit(value.trim());
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-background">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3">
          <Link
            href="/dashboard"
            className="font-mono text-[13px] tracking-[0.04em] text-[color:var(--code-comment)] transition-colors hover:text-[color:var(--ink)]"
          >
            {username ?? ""}
          </Link>

          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleResumeUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label="Upload resume"
              className="flex size-8 items-center justify-center text-[color:var(--code-comment)] transition-colors hover:text-[color:var(--ink)] disabled:opacity-40"
            >
              <Upload className="size-4" strokeWidth={1.5} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setLinkedinModalOpen(true)}
              aria-label="Connect LinkedIn"
              className="flex size-8 items-center justify-center text-[color:var(--code-comment)] transition-colors hover:text-[color:var(--ink)]"
            >
              <LinkedInIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              aria-label="New link"
              className="flex size-8 items-center justify-center text-[color:var(--code-comment)] transition-colors hover:text-[color:var(--ink)]"
            >
              <Plus className="size-5" strokeWidth={1.5} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {linkedinModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLinkedinModalOpen(false);
          }}
        >
          <div className="w-full max-w-md px-6">
            <form onSubmit={handleLinkedinSubmit} noValidate>
              <div className="relative">
                <input
                  ref={linkedinInputRef}
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  value={linkedinUrl}
                  onChange={handleLinkedinChange}
                  placeholder="Paste LinkedIn profile URL"
                  disabled={linkedinSubmitting}
                  className={cn(
                    "h-11 w-full rounded-md border bg-[var(--surface)] px-3 pr-10 font-mono text-sm text-[color:var(--ink)] outline-none transition-colors placeholder:text-[color:var(--code-comment)]",
                    linkedinSubmitting
                      ? "cursor-not-allowed opacity-60"
                      : "border-[var(--paper-line)] focus:border-[var(--ink-muted)]",
                  )}
                />
                <div
                  className={cn(
                    "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transition-opacity",
                    linkedinSubmitting ? "opacity-60" : linkedinUrl.trim() ? "opacity-60" : "opacity-25",
                  )}
                >
                  {linkedinSubmitting ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="animate-spin text-[color:var(--code-comment)]"
                      aria-hidden
                    >
                      <circle cx="8" cy="8" r="6" strokeOpacity="0.25" />
                      <path d="M14 8a6 6 0 0 0-6-6" />
                    </svg>
                  ) : (
                    <LinkedInIcon className="size-4 text-[color:var(--ink)]" />
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="w-full max-w-md px-6">
            <form onSubmit={handleSubmit} noValidate>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  value={url}
                  onChange={handleChange}
                  placeholder="Paste job posting URL"
                  disabled={submitting}
                  className={cn(
                    "h-11 w-full rounded-md border bg-[var(--surface)] px-3 pr-10 font-mono text-sm text-[color:var(--ink)] outline-none transition-colors placeholder:text-[color:var(--code-comment)]",
                    submitting
                      ? "cursor-not-allowed opacity-60"
                      : "border-[var(--paper-line)] focus:border-[var(--ink-muted)]",
                  )}
                />
                <div
                  className={cn(
                    "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transition-opacity",
                    submitting ? "opacity-60" : url.trim() ? "opacity-60" : "opacity-25",
                  )}
                >
                  {submitting ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="animate-spin text-[color:var(--code-comment)]"
                      aria-hidden
                    >
                      <circle cx="8" cy="8" r="6" strokeOpacity="0.25" />
                      <path d="M14 8a6 6 0 0 0-6-6" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[color:var(--ink)]"
                      aria-hidden
                    >
                      <path d="M2 11V5a2 2 0 0 1 2-2h6" />
                      <path d="M8 1l3 3-3 3" />
                    </svg>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
