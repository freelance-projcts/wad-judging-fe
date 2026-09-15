// Re-exports the domain/API types under the names this feature already used,
// so the event gender options and shapes always match what the backend
// actually accepts (see wad-judging-be/src/lib/validators.ts `eventSchema`).
export type { Gender as EventGender } from "@/lib/domain";
export {
  GENDER_OPTIONS as EVENT_GENDER_OPTIONS,
  genderLabel as eventGenderLabel,
} from "@/lib/domain";
export type { WadEvent, EventInput as EventFormValues } from "@/lib/api/events";
