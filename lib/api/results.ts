import type { Gender, Province, Team } from "@/lib/domain";
import { apiFetch } from "./client";

/** Which bucket the backend grouped by - driven by the x-grouping-mode header (1 = PROVINCE, 2 = CLUB). */
export type ResultsGroupBy = "PROVINCE" | "CLUB";

/** Raw judge marks for a single round — D/E1-E4/P as entered (each with its supervisor), plus that round's own final score. */
export type RoundMark = {
  round: number;
  d: number;
  dSupervisor: string | null;
  e1: number;
  e1Supervisor: string | null;
  e2: number;
  e2Supervisor: string | null;
  e3: number;
  e3Supervisor: string | null;
  e4: number;
  e4Supervisor: string | null;
  p: number;
  pSupervisor: string | null;
  finalScore: number;
};

export type TeamPerformanceStudentRow = {
  rank: number;
  studentId: string;
  code: string;
  fullName: string;
  finalScore: number;
  marks: RoundMark[];
  countedTowardTotal: boolean;
};
export type TeamPerformanceTeamGroup = {
  team: Team;
  teamTotal: number;
  countedStudentCount: number;
  students: TeamPerformanceStudentRow[];
};
export type TeamPerformanceProvinceGroup = {
  province: Province;
  provinceLabel: string;
  teams: TeamPerformanceTeamGroup[];
};
export type TeamPerformanceClubGroup = {
  clubId: string;
  clubName: string;
  teams: TeamPerformanceTeamGroup[];
};
export type TeamPerformanceResponse = {
  eventId: string;
  eventName: string;
  performanceId: string;
  performanceName: string;
  groupBy: ResultsGroupBy;
  /** Populated only when groupBy is PROVINCE (top 5 per team count toward teamTotal). */
  provinces: TeamPerformanceProvinceGroup[];
  /** Populated only when groupBy is CLUB (every student counts toward teamTotal). */
  clubs: TeamPerformanceClubGroup[];
};

export const getTeamPerformanceResults = (eventId: string) =>
  apiFetch<TeamPerformanceResponse>("/results/team-performance", { query: { eventId } });

export type TopEightStudentRow = {
  rank: number;
  studentId: string;
  code: string;
  fullName: string;
  clubId: string | null;
  clubName: string | null;
  team: Team | null;
  finalScore: number;
  marks: RoundMark[];
};
export type TopEightProvinceGroup = {
  province: Province;
  provinceLabel: string;
  students: TopEightStudentRow[];
};
export type TopEightResponse = {
  eventId: string;
  eventName: string;
  performanceId: string;
  performanceName: string;
  groupBy: ResultsGroupBy;
  /** Top 3 (+ties) per province - populated only when groupBy is PROVINCE. */
  provinces: TopEightProvinceGroup[];
  /** Flat top 10 (+ties) across all clubs - populated only when groupBy is CLUB. */
  students: TopEightStudentRow[];
};

export const getTopEightResults = (eventId: string) =>
  apiFetch<TopEightResponse>("/results/top-eight", { query: { eventId } });

export type PerformanceTwoStudentRow = {
  rank: number;
  studentId: string;
  code: string;
  fullName: string;
  province: Province | null;
  provinceLabel: string | null;
  clubId: string | null;
  clubName: string | null;
  team: Team | null;
  finalScore: number;
  marks: RoundMark[];
};
export type PerformanceTwoResponse = {
  eventId: string;
  eventName: string;
  performanceId: string;
  performanceName: string;
  results: PerformanceTwoStudentRow[];
};

export const getPerformanceTwoResults = (eventId: string) =>
  apiFetch<PerformanceTwoResponse>("/results/performance-two", { query: { eventId } });

export type AllRounderEventBreakdown = {
  eventId: string;
  eventName: string;
  performanceId: string;
  performanceName: string | null;
  hasMark: boolean;
  finalScore: number | null;
  marks: RoundMark[];
};
export type AllRounderStudentRow = {
  rank: number;
  studentId: string;
  code: string;
  fullName: string;
  gender: Gender;
  province: Province | null;
  provinceLabel: string | null;
  clubId: string | null;
  clubName: string | null;
  team: Team | null;
  totalScore: number;
  eventsScored: number;
  events: AllRounderEventBreakdown[];
};
export type AllRounderResponse = {
  events: { id: string; name: string; performanceId: string; performanceName: string | null }[];
  students: AllRounderStudentRow[];
};
export type AllRounderQuery = {
  gender?: Gender;
  province?: Province;
  clubId?: string;
  team?: Team;
};

export const getAllRounderResults = (query: AllRounderQuery = {}) =>
  apiFetch<AllRounderResponse>("/results/all-rounders", { query });
