// Tournament grouping mode chosen on the login screen. Sent to the backend on
// every API request as the `x-grouping-mode` header (see ./client.ts).

export const GROUPING_MODE_HEADER = "x-grouping-mode";

export const GROUPING_MODE = {
  SCHOOL: "1",
  CLUB: "2",
} as const;

export type GroupingMode = (typeof GROUPING_MODE)[keyof typeof GROUPING_MODE];

export const DEFAULT_GROUPING_MODE: GroupingMode = GROUPING_MODE.SCHOOL;

const STORAGE_KEY = "wad_grouping_mode";

const isGroupingMode = (value: unknown): value is GroupingMode =>
  value === GROUPING_MODE.SCHOOL || value === GROUPING_MODE.CLUB;

export const getStoredGroupingMode = (): GroupingMode | null => {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isGroupingMode(value) ? value : null;
  } catch {
    return null;
  }
};

// Fired on the same tab after a change (the native "storage" event only
// fires in *other* tabs), so useGroupingMode() subscribers re-render.
const CHANGE_EVENT = "wad:grouping-mode-change";

export const setStoredGroupingMode = (mode: GroupingMode): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Storage unavailable (private mode, quota) - header falls back to default.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

export const subscribeGroupingMode = (onChange: () => void): (() => void) => {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
};
