"use client";

import { BellOutlined, CheckCircleOutlined, EditOutlined } from "@ant-design/icons";
import { Alert, Badge, Empty, Spin, Tag } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import type { ReactNode } from "react";

import { listNotifications, markNotificationRead, type Notification } from "@/lib/api/notifications";
import { ApiError } from "@/lib/api/client";

const typeMeta: Record<Notification["type"], { label: string; color: string; icon: ReactNode }> = {
  MARK_ENTRY: { label: "Mark Entry", color: "blue", icon: <CheckCircleOutlined /> },
  EDIT_REQUEST: { label: "Edit Request", color: "orange", icon: <EditOutlined /> },
};

export const NotificationsTab = () => {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: listNotifications,
  });

  const readMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = notificationsQuery.data?.notifications ?? [];

  if (notificationsQuery.isError) {
    return (
      <Alert
        type="error"
        showIcon
        message="Could not load notifications."
        description={
          notificationsQuery.error instanceof ApiError ? notificationsQuery.error.message : undefined
        }
      />
    );
  }

  if (notificationsQuery.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spin />
      </div>
    );
  }

  if (notifications.length === 0) {
    return <Empty description="No notifications yet" />;
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => {
        const meta = typeMeta[notification.type];
        return (
          <button
            key={notification.id}
            type="button"
            disabled={notification.isRead}
            onClick={() => readMutation.mutate(notification.id)}
            className={[
              "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
              notification.isRead
                ? "border-slate-200 bg-white"
                : "border-blue-200 bg-blue-50 hover:bg-blue-100",
            ].join(" ")}
          >
            <span className="mt-0.5 shrink-0 text-slate-400">
              {notification.isRead ? <BellOutlined /> : <Badge dot color="blue" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Tag color={meta.color} icon={meta.icon}>
                  {meta.label}
                </Tag>
                <span className="text-xs text-slate-400">
                  {dayjs(notification.createdAt).format("DD MMM YYYY, HH:mm")}
                </span>
              </div>
              <p
                className={[
                  "truncate text-sm",
                  notification.isRead ? "text-slate-600" : "font-medium text-slate-900",
                ].join(" ")}
              >
                {notification.message}
              </p>
            </div>
            {!notification.isRead ? (
              <span className="mt-0.5 shrink-0 text-xs font-medium text-blue-600">Mark as read</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};
