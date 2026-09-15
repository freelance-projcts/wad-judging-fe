import { apiFetch } from "./client";

export type EditRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type EditRequestSummary = {
  id: string;
  status: EditRequestStatus;
};

/**
 * GET /api/edit-requests: admins get every request, judges get only the
 * ones they raised. Used on the Home page to show a "Pending Requests"
 * count that's meaningful for whoever is signed in.
 */
export const listEditRequests = () =>
  apiFetch<{ requests: EditRequestSummary[] }>("/edit-requests").then(
    (res) => res.requests,
  );
