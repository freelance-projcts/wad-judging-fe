// Re-exports the domain/API types under the names this feature already used,
// so the filters/labels/form always match what the backend actually accepts
// (see wad-judging-be/src/lib/validators.ts `studentSchema`).
export type { Gender, Province, Team } from "@/lib/domain";
export {
  GENDER_OPTIONS,
  PROVINCE_OPTIONS,
  TEAM_OPTIONS,
  genderLabel,
  provinceLabel,
  teamLabel,
} from "@/lib/domain";
export type {
  Student as Player,
  StudentInput as PlayerFormValues,
} from "@/lib/api/students";
