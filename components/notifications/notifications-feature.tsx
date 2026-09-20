"use client";

import { Badge, Tabs } from "antd";
import { useQuery } from "@tanstack/react-query";

import { EditRequestsTab } from "./edit-requests-tab";
import { NotificationsTab } from "./notifications-tab";
import { listNotifications } from "@/lib/api/notifications";
import { listEditRequests } from "@/lib/api/edit-requests";

export const NotificationsFeature = () => {
  const notificationsQuery = useQuery({ queryKey: ["notifications"], queryFn: listNotifications });
  const editRequestsQuery = useQuery({ queryKey: ["edit-requests"], queryFn: listEditRequests });

  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;
  const pendingCount = (editRequestsQuery.data ?? []).filter((r) => r.status === "PENDING").length;

  return (
    <div className="mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Notifications</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Tabs
          items={[
            {
              key: "notifications",
              label: (
                <Badge count={unreadCount} size="small" offset={[8, 0]}>
                  <span>Notifications</span>
                </Badge>
              ),
              children: <NotificationsTab />,
            },
            {
              key: "edit-requests",
              label: (
                <Badge count={pendingCount} size="small" offset={[8, 0]}>
                  <span>Edit Requests</span>
                </Badge>
              ),
              children: <EditRequestsTab />,
            },
          ]}
        />
      </div>
    </div>
  );
};
