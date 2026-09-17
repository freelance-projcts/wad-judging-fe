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

export type CreateEditRequestInput = {
  markEntryId: string;
  reason?: string | null;
};

/**
 * POST /api/edit-requests — judge-only: asks an admin for permission to
 * resubmit an already-recorded round's marks. Rejected with 409 if the same
 * judge already has a pending request for that mark entry.
 */
export const createEditRequest = (input: CreateEditRequestInput) =>
  apiFetch<{ request: { id: string } }>("/edit-requests", {
    method: "POST",
    body: input,
  }).then((res) => res.request);
