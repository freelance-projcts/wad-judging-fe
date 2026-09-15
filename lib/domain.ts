// Shared enums + display helpers for values the backend persists as
// Prisma enums (see wad-judging-be/prisma/schema.prisma). Kept in one place
// so students and events — which both carry a `gender` — stay in sync with
// what the API actually accepts instead of drifting into UI-only mock values.

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type Province =
  | "WESTERN"
  | "CENTRAL"
  | "SOUTHERN"
  | "NORTHERN"
  | "EASTERN"
  | "NORTH_WESTERN"
  | "NORTH_CENTRAL"
  | "UVA"
  | "SABARAGAMUWA";

export type Team = "A" | "B";

export const GENDER_OPTIONS: { label: string; value: Gender }[] = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Other", value: "OTHER" },
];

export const PROVINCE_OPTIONS: { label: string; value: Province }[] = [
  { label: "Western", value: "WESTERN" },
  { label: "Central", value: "CENTRAL" },
  { label: "Southern", value: "SOUTHERN" },
  { label: "Northern", value: "NORTHERN" },
  { label: "Eastern", value: "EASTERN" },
  { label: "North Western", value: "NORTH_WESTERN" },
  { label: "North Central", value: "NORTH_CENTRAL" },
  { label: "Uva", value: "UVA" },
  { label: "Sabaragamuwa", value: "SABARAGAMUWA" },
];

export const TEAM_OPTIONS: { label: string; value: Team }[] = [
  { label: "Team A", value: "A" },
  { label: "Team B", value: "B" },
];

const labelFrom = <T extends string>(
  options: { label: string; value: T }[],
  value: T,
) => options.find((o) => o.value === value)?.label ?? value;

export const genderLabel = (value: Gender) => labelFrom(GENDER_OPTIONS, value);
export const provinceLabel = (value: Province) =>
  labelFrom(PROVINCE_OPTIONS, value);
export const teamLabel = (value: Team | null | undefined) =>
  value ? labelFrom(TEAM_OPTIONS, value) : "Unassigned";
