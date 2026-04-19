import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connect",
  description:
    "Paste a job posting and connect GitHub to build your recruiter-facing summary.",
};

export default function ConnectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
