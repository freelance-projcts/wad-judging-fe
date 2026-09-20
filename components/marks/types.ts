// Re-exports the domain/API types under names this feature uses, so filters
// and labels stay in sync with what the backend actually accepts (see
// wad-judging-be/src/lib/validators.ts `roundScoresSchema`).
export type { Gender, Province } from "@/lib/domain";
export {
  GENDER_OPTIONS,
  PROVINCE_OPTIONS,
  genderLabel,
  provinceLabel,
  teamLabel,
} from "@/lib/domain";
export type { WadEvent } from "@/lib/api/events";
export type { Student } from "@/lib/api/students";
export type { Performance } from "@/lib/api/performances";
export type { MarkEntry, RoundInput } from "@/lib/api/marks";

import type { WadEvent } from "@/lib/api/events";
import type { MarkEntry, RoundInput } from "@/lib/api/marks";

/** One judging position — a row in the Add Marks form, matching the fixed
 * D / E1-E4 / P panel `roundScoresSchema` expects for every round. */
export type PositionKey = "d" | "e1" | "e2" | "e3" | "e4" | "p";

export type MarkPosition = {
  key: PositionKey;
  label: string;
};

export const MARK_POSITIONS: MarkPosition[] = [
  { key: "d", label: "D" },
  { key: "e1", label: "E1" },
  { key: "e2", label: "E2" },
  { key: "e3", label: "E3" },
  { key: "e4", label: "E4" },
  { key: "p", label: "P" },
];

/** How many rounds a student/event pair is judged over — driven by the
 * event's `supportsMultipleRounds` flag (see wad-judging-be `eventSchema`). */
export const eventRounds = (
  event: Pick<WadEvent, "supportsMultipleRounds"> | null | undefined,
): readonly number[] => (event?.supportsMultipleRounds ? [1, 2] : [1]);

const SCORE_FIELD = {
  d: "dScore",
  e1: "e1Score",
  e2: "e2Score",
  e3: "e3Score",
  e4: "e4Score",
  p: "penaltyScore",
} as const satisfies Record<PositionKey, keyof MarkEntry>;

const SUPERVISOR_FIELD = {
  d: "dSupervisor",
  e1: "e1Supervisor",
  e2: "e2Supervisor",
  e3: "e3Supervisor",
  e4: "e4Supervisor",
  p: "penaltySupervisor",
} as const satisfies Record<PositionKey, keyof MarkEntry>;

/** Reads a position's saved score (a Decimal-as-string) as a number, for prefilling the form. */
export const markEntryScore = (entry: MarkEntry, key: PositionKey): number =>
  Number(entry[SCORE_FIELD[key]]);

export const markEntrySupervisor = (entry: MarkEntry, key: PositionKey): string | null =>
  (entry[SUPERVISOR_FIELD[key]] as string | null) ?? null;

/** One round's inputs as the Add Marks form edits them, keyed by position. */
export type RoundFormValues = {
  [K in PositionKey as K]?: number | null;
} & {
  [K in PositionKey as `${K}Supervisor`]?: string | null;
};

/** Whether the judge has started filling in this round at all — used so an
 * untouched round (e.g. Round 2, not yet judged) isn't forced to be required. */
export const isRoundTouched = (values: RoundFormValues | undefined): boolean => {
  if (!values) return false;
  return MARK_POSITIONS.some(({ key }) => {
    const score = values[key];
    const supervisor = values[`${key}Supervisor`];
    return (
      (score !== null && score !== undefined) ||
      (supervisor != null && supervisor.trim() !== "")
    );
  });
};

export const roundFormToInput = (round: number, values: RoundFormValues): RoundInput => ({
  round,
  d: values.d ?? 0,
  dSupervisor: values.dSupervisor ?? null,
  e1: values.e1 ?? 0,
  e1Supervisor: values.e1Supervisor ?? null,
  e2: values.e2 ?? 0,
  e2Supervisor: values.e2Supervisor ?? null,
  e3: values.e3 ?? 0,
  e3Supervisor: values.e3Supervisor ?? null,
  e4: values.e4 ?? 0,
  e4Supervisor: values.e4Supervisor ?? null,
  p: values.p ?? 0,
  pSupervisor: values.pSupervisor ?? null,
});
