import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth-guard";

export const metadata: Metadata = {
  title: "Generating",
  description:
    "Specialized agents are analyzing your commits and the role you shared.",
};

export default function GeneratingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
