"use client";

import { DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, Empty, Select, Spin, Table, Tag, type TableProps } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { listEvents } from "@/lib/api/events";
import {
  getTopEightResults,
  type RoundMark,
  type TopEightResponse,
  type TopEightStudentRow,
} from "@/lib/api/results";
import { ApiError } from "@/lib/api/client";
import { downloadCsv } from "@/lib/csv";
import { PROVINCE_OPTIONS, teamLabel, type Province } from "@/lib/domain";
import { useClubs } from "@/lib/hooks/use-clubs";
import { useIsClubMode } from "@/lib/hooks/use-grouping-mode";
import { toOverallTopEightRanking } from "@/lib/results-ranking";

/** One ranked row - grouped by province (School mode) or club (Club mode). */
type FlatRow = TopEightStudentRow & {
  overallRank: number;
  isTopEight: boolean;
  /** Province code or clubId, matched against the filter. */
  groupKey: string | null;
  groupLabel: string;
};

/**
 * School mode: the backend buckets top 3 per province, so flatten + re-rank
 * them overall. Club mode: the backend already returns one flat top 10
 * (+ties) across all clubs - every row there is a qualifier.
 */
const toRows = (data: TopEightResponse | undefined): FlatRow[] => {
  if (!data) return [];
  if (data.groupBy === "CLUB") {
    return data.students.map((s) => ({
      ...s,
      overallRank: s.rank,
      isTopEight: true,
      groupKey: s.clubId,
      groupLabel: s.clubName ?? "—",
    }));
  }
  return toOverallTopEightRanking(data.provinces).map((r) => ({
    ...r,
    groupKey: r.province,
    groupLabel: r.provinceLabel,
  }));
};

// A multi-round event's Score here averages every round - the D/E1-E4/P
// breakdown columns still only show round 1's raw marks (same simplification
// as the Team Performance tab), since there's no single round to show once
// the score itself is an average.
const roundOneMark = (row: FlatRow): RoundMark | undefined => row.marks[0];

const markCell = (
  key: "d" | "e1" | "e2" | "e3" | "e4" | "p",
): NonNullable<TableProps<FlatRow>["columns"]>[number] => ({
  title: key.toUpperCase(),
  key,
  width: 56,
  align: "center",
  render: (_: unknown, row: FlatRow) => roundOneMark(row)?.[key].toFixed(2) ?? "—",
});

const columns: TableProps<FlatRow>["columns"] = [
  {
    title: "Rank",
    dataIndex: "overallRank",
    key: "overallRank",
    width: 64,
    render: (rank: number, row) => (
      <span className={row.isTopEight ? "font-bold text-amber-700" : undefined}>{rank}</span>
    ),
  },
  { title: "Id", dataIndex: "code", key: "code", width: 72 },
  { title: "Name", dataIndex: "fullName", key: "fullName", width: 160, ellipsis: true },
  { title: "Province", dataIndex: "groupLabel", key: "groupLabel", width: 120 },
  {
    title: "Team",
    dataIndex: "team",
    key: "team",
    width: 90,
    render: (team: FlatRow["team"]) => <Tag color={team ? "blue" : "default"}>{teamLabel(team)}</Tag>,
  },
  markCell("d"),
  markCell("e1"),
  markCell("e2"),
  markCell("e3"),
  markCell("e4"),
  markCell("p"),
  {
    title: "Score",
    dataIndex: "finalScore",
    key: "finalScore",
    width: 80,
    align: "center",
    className: "bg-blue-50",
    render: (score: number, row) => (
      <span className={`font-bold ${row.isTopEight ? "text-amber-700" : "text-blue-700"}`}>
        {score.toFixed(2)}
      </span>
    ),
  },
];

export const TopEightTab = () => {
  const [eventId, setEventId] = useState<string | null>(null);
  // Province code (School mode) or clubId (Club mode).
  const [groupKey, setGroupKey] = useState<string | null>(null);
  const isClubMode = useIsClubMode();
  const clubs = useClubs({ enabled: isClubMode });

  const eventsQuery = useQuery({ queryKey: ["events"], queryFn: () => listEvents() });
  const selectedEvent = eventsQuery.data?.find((e) => e.id === eventId) ?? null;

  const resultsQuery = useQuery({
    queryKey: ["results", "top-8", eventId, isClubMode],
    queryFn: () => getTopEightResults(eventId!),
    enabled: Boolean(eventId),
  });

  const isClubResult = resultsQuery.data?.groupBy === "CLUB";
  const groupHeader = isClubResult ? "Club" : "Province";
  // The ranking is always computed from the full, unfiltered set so a row's
  // rank/highlight never shifts with the province/club filter. The filter
  // only narrows which rows are *shown*; once applied there's no single-group
  // "top 8" to highlight, so the highlight is suppressed for the subset.
  const rankedAll = toRows(resultsQuery.data);
  const rows = groupKey
    ? rankedAll.filter((r) => r.groupKey === groupKey).map((r) => ({ ...r, isTopEight: false }))
    : rankedAll;
  const tableColumns = (columns ?? []).map((c) =>
    c.key === "groupLabel" ? { ...c, title: groupHeader } : c,
  );
  const canExport = rows.length > 0;

  const handleExport = () => {
    if (!resultsQuery.data) return;
    downloadCsv(
      `top-8-${resultsQuery.data.eventName}.csv`,
      ["Rank", "Id", "Name", groupHeader, "Team", "D", "E1", "E2", "E3", "E4", "P", "Score", "Top 8"],
      rows.map((r) => {
        const mark = roundOneMark(r);
        return [
          r.overallRank,
          r.code,
          r.fullName,
          r.groupLabel,
          teamLabel(r.team),
          mark?.d.toFixed(2) ?? "",
          mark?.e1.toFixed(2) ?? "",
          mark?.e2.toFixed(2) ?? "",
          mark?.e3.toFixed(2) ?? "",
          mark?.e4.toFixed(2) ?? "",
          mark?.p.toFixed(2) ?? "",
          r.finalScore.toFixed(2),
          r.isTopEight ? "Yes" : "No",
        ];
      }),
      {
        type: "Top 8",
        eventName: resultsQuery.data.eventName,
        gender: selectedEvent?.gender,
        province: !isClubResult && groupKey ? (groupKey as Province) : null,
        club: isClubResult && groupKey ? (rows[0]?.groupLabel ?? null) : null,
      },
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-600">Event</span>
          <Select
            className="w-56"
            placeholder="Select event"
            loading={eventsQuery.isLoading}
            value={eventId ?? undefined}
            onChange={(value) => {
              setEventId(value);
              setGroupKey(null);
            }}
            options={(eventsQuery.data ?? []).map((e) => ({ label: e.name, value: e.id }))}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-600">
            {isClubMode ? "Club" : "Province"} (optional)
          </span>
          <Select<string>
            allowClear
            className="w-53"
            placeholder={isClubMode ? "All clubs" : "All provinces"}
            disabled={!eventId}
            loading={isClubMode && clubs.isLoading}
            showSearch={{ optionFilterProp: "label" }}
            value={groupKey ?? undefined}
            onChange={(value) => setGroupKey(value ?? null)}
            options={isClubMode ? clubs.options : PROVINCE_OPTIONS}
          />
        </label>

        <Button
          icon={<DownloadOutlined />}
          className="ml-auto"
          disabled={!canExport}
          onClick={handleExport}
        >
          Export CSV
        </Button>
      </div>

      {!eventId ? (
        <Empty description="Select an event to load results" />
      ) : resultsQuery.isError ? (
        <Alert
          type="error"
          showIcon
          message="Could not load results."
          description={
            resultsQuery.error instanceof ApiError ? resultsQuery.error.message : undefined
          }
        />
      ) : resultsQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : rows.length === 0 ? (
        <Empty
          description={
            groupKey
              ? `No marks recorded for this ${isClubMode ? "club" : "province"} yet`
              : "No marks recorded for this event yet"
          }
        />
      ) : (
        <Table<FlatRow>
          columns={tableColumns}
          dataSource={rows}
          rowKey="studentId"
          size="small"
          pagination={false}
          scroll={{ x: "max-content" }}
          rowClassName={(row) => (row.isTopEight ? "bg-amber-50" : "")}
        />
      )}
    </div>
  );
};
