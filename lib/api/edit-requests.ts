import type { MarkEntry } from "./marks";
import type { Student } from "./students";
import type { WadEvent } from "./events";
import type { Performance } from "./performances";
import { apiFetch } from "./client";

export type EditRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type EditRequest = {
  id: string;
  markEntryId: string;
  requesterId: string;
  reason: string | null;
  status: EditRequestStatus;
  resolvedById: string | null;
  resolvedAt: string | null;
  createdAt: string;
  requester: { id: string; name: string };
  markEntry: MarkEntry & {
    student: Student;
    event: WadEvent;
    performance: Performance;
  };
};

/**
 * GET /api/edit-requests: admins get every request, judges get only the
 * ones they raised.
 */
export const listEditRequests = () =>
  apiFetch<{ requests: EditRequest[] }>("/edit-requests").then((res) => res.requests);

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

/**
 * PATCH /api/edit-requests/:id — admin-only. Approving lets the requesting
 * judge resubmit that one mark entry once; the approval is consumed the
 * moment it's used.
 */
export const resolveEditRequest = (
  id: string,
  status: Extract<EditRequestStatus, "APPROVED" | "REJECTED">,
) =>
  apiFetch<{ request: EditRequest }>(`/edit-requests/${id}`, {
    method: "PATCH",
    body: { status },
  }).then((res) => res.request);
