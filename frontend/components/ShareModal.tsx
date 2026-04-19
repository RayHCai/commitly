"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  Copy,
  MessageSquare,
  Share2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconLinkedIn } from "@/components/recruiter/social-icons";
import { cn } from "@/lib/utils";
import { mockUser } from "@/lib/mockData";

export type ShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  linkUrl: string;
  role: string;
  company: string;
};

/** Clipboard-safe URL (https://…) */
function fullUrl(display: string): string {
  const t = display.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  return `https://${t}`;
}

function linkedInBody(linkUrl: string, role: string, company: string) {
  return `Thought this might be useful: ${fullUrl(linkUrl)} - it shows how my code maps to the ${role} at ${company}.`;
}

function coldBody(linkUrl: string, role: string, company: string) {
  return `Sharing in case helpful: ${fullUrl(linkUrl)} - it's a technical summary of how my code fits the ${role} at ${company}.`;
}

type QuickKey = "linkedin" | "job" | "cold";

export function ShareModal({
  isOpen,
  onClose,
  linkUrl,
  role,
  company,
}: ShareModalProps) {
  const [mainCopied, setMainCopied] = React.useState(false);
  const [quickCopied, setQuickCopied] = React.useState<QuickKey | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  const displayUrl = fullUrl(linkUrl);

  React.useEffect(() => {
    if (!isOpen) {
      setMainCopied(false);
      setQuickCopied(null);
      setToast(null);
    }
  }, [isOpen]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2000);
  }

  async function copyText(text: string, toastMsg: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(toastMsg);
    } catch {
      /* ignore */
    }
  }

  async function handleCopyMain() {
    await copyText(displayUrl, "Link copied.");
    setMainCopied(true);
    window.setTimeout(() => setMainCopied(false), 2000);
  }

  async function handleQuickCopy(key: QuickKey) {
    let text = "";
    if (key === "linkedin") text = linkedInBody(linkUrl, role, company);
    else if (key === "job") text = fullUrl(linkUrl);
    else text = coldBody(linkUrl, role, company);

    await copyText(text, key === "job" ? "Link copied." : "Copied.");
    setQuickCopied(key);
    window.setTimeout(() => setQuickCopied(null), 2000);
  }

  const previewTitle = `${mockUser.fullName} for ${role} at ${company}`;
  const previewDescription = `See how ${mockUser.fullName}'s commits match the role.`;

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DialogContent
          showCloseButton={false}
          overlayClassName="fixed inset-0 isolate z-50 bg-black/45 backdrop-blur-[2px] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
          className={cn(
            "max-h-[min(90vh,calc(100%-2rem))] w-full max-w-[calc(100%-1.5rem)] gap-0 overflow-y-auto rounded-xl border border-border bg-card p-0 text-foreground shadow-xl sm:max-w-[540px]",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative p-6 md:p-8"
          >
            <DialogClose className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </DialogClose>

            <header className="pr-10">
              <DialogTitle className="font-serif text-2xl font-normal tracking-tight text-foreground md:text-3xl">
                Share your link.
              </DialogTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                One link. Anywhere recruiters look.
              </p>
            </header>

            <section className="mt-8">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Your link
              </p>
              <div className="relative mt-3 flex items-stretch gap-0">
                <input
                  readOnly
                  value={displayUrl}
                  className="min-h-11 w-full flex-1 rounded-lg border border-input bg-muted/30 py-2.5 pl-3 pr-[5.5rem] font-mono text-xs text-foreground outline-none md:text-sm"
                  aria-label="Shareable URL"
                />
                <Button
                  type="button"
                  size="sm"
                  variant={mainCopied ? "ghost" : "default"}
                  className={cn(
                    "absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-md px-3 text-xs font-medium",
                    mainCopied && "text-primary hover:bg-primary/10 hover:text-primary"
                  )}
                  onClick={handleCopyMain}
                >
                  {mainCopied ? "Copied" : "Copy"}
                </Button>
              </div>
            </section>

            <div className="my-8 border-t border-border" />

            <section>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Quick share
              </p>
              <ul className="mt-4 space-y-3">
                <QuickShareCard
                  icon={
                    <IconLinkedIn className="size-5 shrink-0 text-[#0A66C2]" />
                  }
                  title="Drop in a LinkedIn comment"
                  subtitle="Copies a pre-written comment you can paste under recruiter posts"
                  copied={quickCopied === "linkedin"}
                  onCopy={() => handleQuickCopy("linkedin")}
                />
                <QuickShareCard
                  icon={<Briefcase className="size-5 shrink-0 text-primary" />}
                  title="Attach to a job application"
                  subtitle="Copies just the URL for additional link fields"
                  copied={quickCopied === "job"}
                  onCopy={() => handleQuickCopy("job")}
                />
                <QuickShareCard
                  icon={
                    <MessageSquare className="size-5 shrink-0 text-primary" />
                  }
                  title="Send in a DM or email"
                  subtitle="Copies a short intro you can personalize"
                  copied={quickCopied === "cold"}
                  onCopy={() => handleQuickCopy("cold")}
                />
              </ul>
            </section>

            <div className="my-8 border-t border-border" />

            <section>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                What recruiters see when you share
              </p>
              <div className="mt-4 flex gap-4 rounded-xl border border-border bg-surface/50 p-4">
                <div
                  className="h-[72px] w-[120px] shrink-0 rounded-lg bg-primary sm:h-[80px]"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-snug text-foreground">
                    {previewTitle}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-[color:var(--text-secondary)]">
                    {previewDescription}
                  </p>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    commitly.io
                  </p>
                </div>
              </div>
            </section>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              We track views so you know when recruiters click.
            </p>
          </motion.div>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {toast ? (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none fixed bottom-8 left-1/2 z-[60] -translate-x-1/2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground shadow-card"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function QuickShareCard({
  icon,
  title,
  subtitle,
  copied,
  onCopy,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex min-w-0 flex-1 gap-3">
        <div className="mt-0.5">{icon}</div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
            {subtitle}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          "h-8 shrink-0 self-start sm:self-center",
          copied && "border-primary/30 text-primary hover:bg-primary/5"
        )}
        onClick={onCopy}
        aria-label={copied ? `Copied: ${title}` : `Copy ${title}`}
      >
        <Copy className="mr-1.5 size-3.5" aria-hidden />
        {copied ? "Copied" : "Copy"}
      </Button>
    </li>
  );
}

export function ShareFab({
  linkUrl,
  role,
  company,
}: Pick<ShareModalProps, "linkUrl" | "role" | "company">) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex size-14 items-center justify-center rounded-full border border-primary/10 bg-primary text-primary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-colors hover:bg-primary-hover hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] active:scale-[0.98]"
        aria-label="Share link"
      >
        <Share2 className="size-6" strokeWidth={1.75} />
      </button>
      <ShareModal
        isOpen={open}
        onClose={() => setOpen(false)}
        linkUrl={linkUrl}
        role={role}
        company={company}
      />
    </>
  );
}
