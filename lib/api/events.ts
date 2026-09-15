import type { Gender } from "@/lib/domain";
import { apiFetch } from "./client";

export type WadEvent = {
  id: string;
  name: string;
  gender: Gender;
  createdAt: string;
  updatedAt: string;
};

export type EventInput = {
  name: string;
  gender: Gender;
};

export type EventListQuery = { search?: string; gender?: Gender };

export const listEvents = (query: EventListQuery = {}) =>
  apiFetch<{ events: WadEvent[] }>("/events", { query }).then(
    (res) => res.events,
  );

export const createEvent = (input: EventInput) =>
  apiFetch<{ event: WadEvent }>("/events", {
    method: "POST",
    body: input,
  }).then((res) => res.event);

export const updateEvent = (id: string, input: EventInput) =>
  apiFetch<{ event: WadEvent }>(`/events/${id}`, {
    method: "PATCH",
    body: input,
  }).then((res) => res.event);

export const deleteEvent = (id: string) =>
  apiFetch<{ ok: true }>(`/events/${id}`, { method: "DELETE" });
