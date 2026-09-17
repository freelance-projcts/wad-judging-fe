import { apiFetch } from "./client";

/** A judging session/panel a judge is granted access to (seeded on the backend). */
export type Performance = {
  id: string;
  name: string;
  order: number;
};

export const listPerformances = () =>
  apiFetch<{ performances: Performance[] }>("/performances").then(
    (res) => res.performances,
  );
