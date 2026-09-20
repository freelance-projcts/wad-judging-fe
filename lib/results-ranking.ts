// Pure ranking helpers shared between the Results screen's Top 8 tab and
// anywhere else that needs the same "best 8 overall, ties included" rule
// (e.g. the Marks screen filtering Performance 2 down to Performance 1's
// qualifiers) — kept out of lib/api so it has no fetching concerns of its own.

import type { Province, Team } from "@/lib/domain";

export type RankableStudent = {
  studentId: string;
  code: string;
  fullName: string;
  team: Team | null;
  finalScore: number;
};

export type OverallRankedRow<T extends RankableStudent> = T & {
  province: Province;
  provinceLabel: string;
  overallRank: number;
  isTopEight: boolean;
};

/**
 * Flattens every province's students into one list, sorted best-to-worst,
 * with a single overall rank (ties share a rank, e.g. 1,2,3,4,5,6,7,8,8,8)
 * and the top-8 cutoff flagged. Ties sitting on the 8th-place score are
 * included in the flag rather than truncated, so "top 8" can mean more than
 * 8 rows when there's a tie at the cutoff.
 */
export function toOverallTopEightRanking<T extends RankableStudent>(
  provinces: { province: Province; provinceLabel: string; students: T[] }[],
): OverallRankedRow<T>[] {
  const flat = provinces.flatMap((p) =>
    p.students.map((s) => ({ ...s, province: p.province, provinceLabel: p.provinceLabel })),
  );
  const sorted = flat
    .slice()
    .sort((a, b) => b.finalScore - a.finalScore || a.code.localeCompare(b.code));

  const ranked: (typeof sorted[number] & { overallRank: number })[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const tiedWithPrevious = i > 0 && sorted[i].finalScore === sorted[i - 1].finalScore;
    ranked.push({ ...sorted[i], overallRank: tiedWithPrevious ? ranked[i - 1].overallRank : i + 1 });
  }

  const cutoffScore = ranked[Math.min(7, ranked.length - 1)]?.finalScore;
  return ranked.map((r) => ({ ...r, isTopEight: r.finalScore >= cutoffScore }));
}
