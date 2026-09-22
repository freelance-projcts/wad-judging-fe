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
 * POST /marks upserts one round at a time - `{ studentId, eventId,
 * performanceId, round, scores: {D,E1,E2,E3,E4,P,DSupervisor,...} }` - there
 * is no `rounds` array, so each touched round is submitted as its own
 * request. The `*Supervisor` keys are sent alongside their scores for the
 * backend to persist once it accepts them (see
 * wad-judging-be/src/lib/validators.ts `markScoresSchema`, which as of this
 * writing still only validates D/E1/E2/E3/E4/P and silently drops unknown
 * keys) - update the backend schema/mark-service/Prisma model to actually
 * store these before relying on them being saved.
 *
 * Overwriting an already-submitted round is only accepted server-side for an
 * admin, or a judge holding an approved (and not-yet-consumed) edit request
 * for it.
 */
export const submitMarks = async (input: SubmitMarksInput): Promise<MarkEntry[]> => {
  const marks: MarkEntry[] = [];
  for (const round of input.rounds) {
    const mark = await apiFetch<{ mark: MarkEntry }>("/marks", {
      method: "POST",
      body: {
        studentId: input.studentId,
        eventId: input.eventId,
        performanceId: input.performanceId,
        round: round.round,
        scores: {
          D: round.d,
          DSupervisor: round.dSupervisor,
          E1: round.e1,
          E1Supervisor: round.e1Supervisor,
          E2: round.e2,
          E2Supervisor: round.e2Supervisor,
          E3: round.e3,
          E3Supervisor: round.e3Supervisor,
          E4: round.e4,
          E4Supervisor: round.e4Supervisor,
          P: round.p,
          PSupervisor: round.pSupervisor,
        },
      },
    }).then((res) => res.mark);
    marks.push(mark);
  }
  return marks;
};
