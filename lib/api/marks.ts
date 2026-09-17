import { apiFetch } from "./client";

/**
 * One judged round for a student/event/performance. Scores come back as
 * strings (Prisma Decimal serializes to string over JSON) — see
 * wad-judging-be/prisma/schema.prisma `MarkEntry`.
 */
export type MarkEntry = {
  id: string;
  studentId: string;
  eventId: string;
  performanceId: string;
  round: number;
  judgeId: string;
  dScore: string;
  dSupervisor: string | null;
  e1Score: string;
  e1Supervisor: string | null;
  e2Score: string;
  e2Supervisor: string | null;
  e3Score: string;
  e3Supervisor: string | null;
  e4Score: string;
  e4Supervisor: string | null;
  penaltyScore: string;
  penaltySupervisor: string | null;
  finalScore: string;
  createdAt: string;
  updatedAt: string;
};

export type RoundInput = {
  round: number;
  d: number;
  dSupervisor?: string | null;
  e1: number;
  e1Supervisor?: string | null;
  e2: number;
  e2Supervisor?: string | null;
  e3: number;
  e3Supervisor?: string | null;
  e4: number;
  e4Supervisor?: string | null;
  p: number;
  pSupervisor?: string | null;
};

export type MarksListQuery = {
  performanceId: string;
  eventId?: string;
  studentId?: string;
};

/** GET /marks — performanceId is required server-side; judges must be assigned to it. */
export const listMarks = (query: MarksListQuery) =>
  apiFetch<{ marks: MarkEntry[] }>("/marks", { query }).then((res) => res.marks);

export type SubmitMarksInput = {
  studentId: string;
  eventId: string;
  performanceId: string;
  rounds: RoundInput[];
};

/**
 * POST /marks creates new rounds or overwrites existing ones. Overwriting an
 * already-submitted round is only accepted server-side for an admin, or a
 * judge holding an approved (and not-yet-consumed) edit request for it.
 */
export const submitMarks = (input: SubmitMarksInput) =>
  apiFetch<{ marks: MarkEntry[] }>("/marks", {
    method: "POST",
    body: input,
  }).then((res) => res.marks);
