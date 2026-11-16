"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { listClubs, type Club } from "@/lib/api/clubs";

// Same root key ClubsFeature invalidates, so adding/renaming a club there
// refreshes every dropdown that uses this hook.
export const CLUBS_QUERY_KEY = ["clubs"] as const;

/**
 * All clubs as Select options plus an id -> name lookup. Student responses
 * only carry `clubId`, so tables use `clubName(id)` to show the name.
 */
export const useClubs = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const query = useQuery({
    queryKey: [...CLUBS_QUERY_KEY, ""],
    queryFn: () => listClubs(),
    enabled,
    staleTime: 60_000,
  });

  return useMemo(() => {
    const clubs: Club[] = query.data ?? [];
    const byId = new Map(clubs.map((c) => [c.id, c.name]));
    return {
      ...query,
      clubs,
      options: clubs.map((c) => ({ label: c.name, value: c.id })),
      clubName: (id: string | null | undefined) =>
        (id ? byId.get(id) : undefined) ?? "—",
    };
  }, [query]);
};
