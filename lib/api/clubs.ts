import { apiFetch } from "./client";

// Mirrors wad-judging-be `/api/clubs` (feature/club-or-province-grouping).

export type Club = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type ClubInput = { name: string };

export type ClubListQuery = { search?: string };

export const listClubs = (query: ClubListQuery = {}) =>
  apiFetch<{ clubs: Club[] }>("/clubs", { query }).then((res) => res.clubs);

export const createClub = (input: ClubInput) =>
  apiFetch<{ club: Club }>("/clubs", { method: "POST", body: input }).then(
    (res) => res.club,
  );

export const updateClub = (id: string, input: ClubInput) =>
  apiFetch<{ club: Club }>(`/clubs/${id}`, {
    method: "PATCH",
    body: input,
  }).then((res) => res.club);

export const deleteClub = (id: string) =>
  apiFetch<{ ok: true }>(`/clubs/${id}`, { method: "DELETE" });
