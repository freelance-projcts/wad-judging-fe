import { apiFetch } from "./client";

export type Role = "ADMIN" | "JUDGE";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  mobileNumber?: string | null;
};

export type AssignedPerformance = { id: string; name: string; order: number };

/** Returned by GET /api/profile (and /api/auth/me): the signed-in user plus
 * the performances they're assigned to (only ever non-empty for judges). */
export type ProfileResponse = {
  user: AuthUser;
  performances: AssignedPerformance[];
};

export type LoginInput = { email: string; password: string };

/** Self-registration always creates a JUDGE account (enforced server-side). */
export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  mobileNumber?: string;
};

type AuthResponse = { user: AuthUser; token: string };

export const roleLabel = (role: Role) => (role === "ADMIN" ? "Admin" : "Judge");

export const login = (input: LoginInput) =>
  apiFetch<AuthResponse>("/auth/login", { method: "POST", body: input });

export const register = (input: RegisterInput) =>
  apiFetch<AuthResponse>("/auth/register", { method: "POST", body: input });

export const logout = () =>
  apiFetch<{ ok: true }>("/auth/logout", { method: "POST" });

export const getProfile = () => apiFetch<ProfileResponse>("/profile");
