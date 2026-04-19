import type { Metadata } from "next";

import { AuthGuard } from "@/components/auth-guard";
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
    <AuthGuard>
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <DashboardHeader />
        <div className="dashboard-shell mx-auto w-full max-w-[1200px] flex-1 overflow-hidden px-6 md:px-8">
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
