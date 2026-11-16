"use client";

import { useSyncExternalStore } from "react";

import {
  DEFAULT_GROUPING_MODE,
  GROUPING_MODE,
  getStoredGroupingMode,
  subscribeGroupingMode,
  type GroupingMode,
} from "@/lib/api/grouping-mode";

/** The tournament type picked on the login screen (School = "1", Club = "2"). */
export const useGroupingMode = (): GroupingMode =>
  useSyncExternalStore(
    subscribeGroupingMode,
    () => getStoredGroupingMode() ?? DEFAULT_GROUPING_MODE,
    () => DEFAULT_GROUPING_MODE,
  );

export const useIsClubMode = (): boolean =>
  useGroupingMode() === GROUPING_MODE.CLUB;
