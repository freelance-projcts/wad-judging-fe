import { apiFetch } from "./client";

/** GET /api/dashboard is ADMIN-only — only fetch this for admins. */
export type DashboardSummary = {
  totalStudents: number;
  totalEvents: number;
  pendingRequests: { total: number; scoreChangeRequests: number };
};

export const getDashboardSummary = () =>
  apiFetch<DashboardSummary>("/dashboard");
