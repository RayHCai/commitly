"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

const TOKEN_KEY = "commitly_token";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      router.replace("/");
      return;
    }

    apiFetch("/users/me")
      .then(() => setAuthenticated(true))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        router.replace("/");
      });
  }, [router]);

  if (!authenticated) return null;

  return <>{children}</>;
}
