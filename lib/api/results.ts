import type { Gender, Province, Team } from "@/lib/domain";
import { apiFetch } from "./client";

export type TeamPerformanceStudentRow = {
  rank: number;
  studentId: string;
  code: string;
  fullName: string;
  finalScore: number;
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
export type TeamPerformanceResponse = {
  eventId: string;
  eventName: string;
  performanceId: string;
  performanceName: string;
  provinces: TeamPerformanceProvinceGroup[];
};

export const getTeamPerformanceResults = (eventId: string) =>
  apiFetch<TeamPerformanceResponse>("/results/team-performance", { query: { eventId } });

export type TopEightStudentRow = {
  rank: number;
  studentId: string;
  code: string;
  fullName: string;
  team: Team | null;
  finalScore: number;
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
  provinces: TopEightProvinceGroup[];
};

export const getTopEightResults = (eventId: string) =>
  apiFetch<TopEightResponse>("/results/top-eight", { query: { eventId } });

export type PerformanceTwoStudentRow = {
  rank: number;
  studentId: string;
  code: string;
  fullName: string;
  province: Province;
  provinceLabel: string;
  team: Team | null;
  finalScore: number;
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
};
export type AllRounderStudentRow = {
  rank: number;
  studentId: string;
  code: string;
  fullName: string;
  gender: Gender;
  province: Province;
  team: Team | null;
  totalScore: number;
  eventsScored: number;
  events: AllRounderEventBreakdown[];
};
export type AllRounderResponse = {
  events: { id: string; name: string; performanceId: string; performanceName: string | null }[];
  students: AllRounderStudentRow[];
};
export type AllRounderQuery = { gender?: Gender; province?: Province; team?: Team };

export const getAllRounderResults = (query: AllRounderQuery = {}) =>
  apiFetch<AllRounderResponse>("/results/all-rounders", { query });
