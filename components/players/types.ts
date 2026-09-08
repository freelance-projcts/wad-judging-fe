export type Team = "TEAM_A" | "TEAM_B";
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

export type Player = {
  id: string;
  name: string;
  team: Team;
  gender: Gender;
  province: Province;
};

// `id` is an entered field, so the form carries the full shape.
export type PlayerFormValues = Player;

export const TEAM_OPTIONS: { label: string; value: Team }[] = [
  { label: "Team A", value: "TEAM_A" },
  { label: "Team B", value: "TEAM_B" },
];

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

const labelFrom = <T extends string>(
  options: { label: string; value: T }[],
  value: T,
) => options.find((o) => o.value === value)?.label ?? value;

export const teamLabel = (value: Team) => labelFrom(TEAM_OPTIONS, value);
export const genderLabel = (value: Gender) => labelFrom(GENDER_OPTIONS, value);
export const provinceLabel = (value: Province) =>
  labelFrom(PROVINCE_OPTIONS, value);

// Mock rows (replace with API results)
export const MOCK_PLAYERS: Player[] = [
  { id: "WAD-1001", name: "Nimesha Bandara", team: "TEAM_A", gender: "FEMALE", province: "WESTERN" },
  { id: "WAD-1002", name: "Sahan Jayakodi", team: "TEAM_A", gender: "MALE", province: "CENTRAL" },
  { id: "WAD-1003", name: "Ashen Amarasinghe", team: "TEAM_B", gender: "MALE", province: "SOUTHERN" },
  { id: "WAD-1004", name: "Umanga Abekoon", team: "TEAM_B", gender: "FEMALE", province: "NORTH_WESTERN" },
  { id: "WAD-1005", name: "Sadewmi Wijesinghe", team: "TEAM_A", gender: "FEMALE", province: "WESTERN" },
  { id: "WAD-1006", name: "Chamod Bandara", team: "TEAM_B", gender: "MALE", province: "UVA" },
  { id: "WAD-1007", name: "Hasitha Alahakoon", team: "TEAM_A", gender: "MALE", province: "SABARAGAMUWA" },
  { id: "WAD-1008", name: "Tharushi Munasinghe", team: "TEAM_B", gender: "FEMALE", province: "EASTERN" },
  { id: "WAD-1009", name: "Ravindu Wickramasinghe", team: "TEAM_A", gender: "MALE", province: "NORTH_CENTRAL" },
  { id: "WAD-1010", name: "Hansini Fernando", team: "TEAM_B", gender: "FEMALE", province: "WESTERN" },
  { id: "WAD-1011", name: "Sanjula Perera", team: "TEAM_A", gender: "MALE", province: "SOUTHERN" },
  { id: "WAD-1012", name: "Nethmi Silva", team: "TEAM_B", gender: "FEMALE", province: "CENTRAL" },
  { id: "WAD-1013", name: "Thisas Rajapaksa", team: "TEAM_A", gender: "MALE", province: "NORTHERN" },
  { id: "WAD-1014", name: "Devmi Gunawardena", team: "TEAM_B", gender: "OTHER", province: "UVA" },
  { id: "WAD-1015", name: "Kavindu Senanayake", team: "TEAM_A", gender: "MALE", province: "WESTERN" },
  { id: "WAD-1016", name: "Ishara Dissanayake", team: "TEAM_B", gender: "FEMALE", province: "CENTRAL" },
  { id: "WAD-1017", name: "Yasas Herath", team: "TEAM_A", gender: "MALE", province: "NORTH_WESTERN" },
  { id: "WAD-1018", name: "Poorni Ekanayake", team: "TEAM_B", gender: "FEMALE", province: "SABARAGAMUWA" },
  { id: "WAD-1019", name: "Dulaj Kariyawasam", team: "TEAM_A", gender: "MALE", province: "SOUTHERN" },
  { id: "WAD-1020", name: "Sithara Weerasinghe", team: "TEAM_B", gender: "FEMALE", province: "EASTERN" },
  { id: "WAD-1021", name: "Movindu Rathnayake", team: "TEAM_A", gender: "MALE", province: "UVA" },
  { id: "WAD-1022", name: "Amaya Gunasekara", team: "TEAM_B", gender: "FEMALE", province: "NORTHERN" },
  { id: "WAD-1023", name: "Senuth Liyanage", team: "TEAM_A", gender: "MALE", province: "NORTH_CENTRAL" },
  { id: "WAD-1024", name: "Rashmi Kodithuwakku", team: "TEAM_B", gender: "FEMALE", province: "WESTERN" },
];
