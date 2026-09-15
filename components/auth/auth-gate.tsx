"use client";

import { Spin } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import ROUTES from "@/constants/routes";
import { useCurrentUser } from "@/lib/hooks/use-current-user";

/** Guards the dashboard routes: redirects to /login when there's no valid session. */
export const AuthGate = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { data, isLoading, isError } = useCurrentUser();
  const isAuthenticated = Boolean(data?.user);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || isError || !isAuthenticated) {
    return (
      <div className="grid min-h-dvh place-items-center bg-slate-50">
        <Spin size="large" />
      </div>
    );
  }

  return children;
};
