import type { Metadata } from "next";

import { mockUser } from "@/lib/mockData";

export const metadata: Metadata = {
  title: `All commits (${mockUser.fullName.split(/\s+/)[0] ?? mockUser.fullName})`,
  description: "Browse analyzed commits, filters, and evidence for this candidate.",
};

export default function CommitsSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
