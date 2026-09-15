import type { Gender, Province, Team } from "@/lib/domain";
import { apiFetch } from "./client";

export type Student = {
  id: string;
  code: string;
  fullName: string;
  gender: Gender;
  province: Province;
  team: Team | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StudentInput = {
  code: string;
  fullName: string;
  gender: Gender;
  province: Province;
  team?: Team | null;
};

export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type StudentListQuery = {
  search?: string;
  gender?: Gender;
  province?: Province;
  team?: Team;
  page?: number;
  pageSize?: number;
};

export const listStudents = (query: StudentListQuery = {}) =>
  apiFetch<PagedResult<Student>>("/students", { query });

export const createStudent = (input: StudentInput) =>
  apiFetch<{ student: Student }>("/students", {
    method: "POST",
    body: input,
  }).then((res) => res.student);

export const updateStudent = (id: string, input: Partial<StudentInput>) =>
  apiFetch<{ student: Student }>(`/students/${id}`, {
    method: "PATCH",
    body: input,
  }).then((res) => res.student);

export const deleteStudent = (id: string) =>
  apiFetch<{ ok: true }>(`/students/${id}`, { method: "DELETE" });
