import { apiFetch } from "./client";

/** POST /api/admins/reset-data is ADMIN-only — irreversibly wipes players,
 * events, marks, and results back to an empty database. */
export const resetDatabase = () =>
  apiFetch<unknown>("/admins/reset-data", { method: "POST" });
