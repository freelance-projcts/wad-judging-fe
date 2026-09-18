"use client";

import { Spin } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import ROUTES from "@/constants/routes";
import { canAccessRoute } from "@/constants/route-access";
import { useCurrentUser } from "@/lib/hooks/use-current-user";

/** Guards the dashboard routes: redirects to /login when there's no valid
 * session, and keeps each role off routes it can't reach (see constants/route-access.ts). */
export const AuthGate = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isLoading, isError } = useCurrentUser();
  const isAuthenticated = Boolean(data?.user);
  const isAdmin = data?.user.role === "ADMIN";
  const isAllowed = canAccessRoute(pathname, isAdmin);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    if (isAuthenticated && !isAllowed) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [isLoading, isAuthenticated, isAllowed, router]);

  if (isLoading || isError || !isAuthenticated || !isAllowed) {
    return (
      <div className="grid min-h-dvh place-items-center bg-slate-50">
        <Spin size="large" />
      </div>
    );
  }

  return children;
};
