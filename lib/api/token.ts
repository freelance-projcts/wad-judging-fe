// Client-side storage for the JWT the backend returns from login/register
// (in addition to setting its own http-only session cookie). The cookie is
// what actually authenticates normal browser requests; this also attaches an
// `Authorization: Bearer <token>` header on every request, since the backend
// accepts either (see wad-judging-be/src/lib/auth.ts `getSession`).

const STORAGE_KEY = "wad_token";

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setStoredToken = (token: string): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Storage can be unavailable (private mode, quota) - the http-only
    // session cookie still authenticates requests either way.
  }
};

export const clearStoredToken = (): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do if storage isn't available.
  }
};
