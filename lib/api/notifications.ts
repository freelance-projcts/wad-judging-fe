import { apiFetch } from "./client";

export type NotificationType = "MARK_ENTRY" | "EDIT_REQUEST";

export type Notification = {
  id: string;
  recipientId: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export type NotificationsResponse = {
  notifications: Notification[];
  unreadCount: number;
};

/** GET /notifications — admin-only; the 50 most recent notifications plus an unread count. */
export const listNotifications = () => apiFetch<NotificationsResponse>("/notifications");

/** PUT /notifications/:id/read — admin-only, and only for the recipient's own notification. */
export const markNotificationRead = (id: string) =>
  apiFetch<{ notification: Notification }>(`/notifications/${id}/read`, {
    method: "PUT",
  }).then((res) => res.notification);
