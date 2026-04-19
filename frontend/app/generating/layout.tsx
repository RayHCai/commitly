import type { Metadata } from "next";

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
  return children;
}
