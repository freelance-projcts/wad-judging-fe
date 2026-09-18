"use client";

import { Spin } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import ROUTES from "@/constants/routes";
import { useCurrentUser } from "@/lib/hooks/use-current-user";

// Judges only ever do their own marks entry — everything else here is
// admin-only management/reporting, kept in sync with dashboard-shell's `adminOnly` nav flags.
const JUDGE_ALLOWED_PREFIXES = [ROUTES.DASHBOARD, ROUTES.MARKS, ROUTES.PROFILE];

/** Guards the dashboard routes: redirects to /login when there's no valid
 * session, and keeps non-admins off admin-only pages. */
export const AuthGate = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isLoading, isError } = useCurrentUser();
  const isAuthenticated = Boolean(data?.user);
  const isAdmin = data?.user.role === "ADMIN";
  const isAllowedForJudge = JUDGE_ALLOWED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    if (isAuthenticated && !isAdmin && !isAllowedForJudge) {
      router.replace(ROUTES.MARKS);
    }
  }, [isLoading, isAuthenticated, isAdmin, isAllowedForJudge, router]);

  if (
    isLoading ||
    isError ||
    !isAuthenticated ||
    (!isAdmin && !isAllowedForJudge)
  ) {
    return (
      <div className="grid min-h-dvh place-items-center bg-slate-50">
        <Spin size="large" />
      </div>
    );
  }

  return children;
};
