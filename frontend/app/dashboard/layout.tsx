import type { Metadata } from "next";

import { DashboardHeader } from "@/components/dashboard-header";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Manage shared links, job postings, showcased projects, and analyzed contributions.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="dashboard-shell mx-auto max-w-[1200px] px-6 py-10 md:px-8 md:py-12 lg:py-14">
        {children}
      </div>
    </div>
  );
}
