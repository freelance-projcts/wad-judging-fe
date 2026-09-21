// Thin fetch wrapper for the WAD Judging backend (wad-judging-be).
//
// Requests always go to this app's own "/api/*" routes. `next.config.ts`
// proxies them to the backend so the browser sees a same-origin call and the
// backend's http-only session cookie works without any CORS setup there.
// Every request also carries `Authorization: Bearer <token>` when a token is
// stored (see ./token.ts) - the backend accepts either the cookie or the
// header, so this works even if the cookie is ever unavailable.

import { getStoredToken } from "./token";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type QueryValue = string | number | boolean | undefined | null;

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, QueryValue>;
};

const buildQueryString = (query?: Record<string, QueryValue>) => {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export async function apiFetch<T>(
  path: string,
  { body, query, headers, ...rest }: ApiRequestOptions = {},
): Promise<T> {
  const token = getStoredToken();

  const response = await fetch(`${API_BASE_URL}${path}${buildQueryString(query)}`, {
    ...rest,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && "error" in payload
        ? String((payload as { error: unknown }).error)
        : response.statusText) || "Something went wrong. Please try again.";
    throw new ApiError(response.status, message);
  }

  return payload as T;
}
