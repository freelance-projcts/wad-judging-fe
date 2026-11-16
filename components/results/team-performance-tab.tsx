"use client";

import { DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, Empty, Select, Spin, Table, type TableProps } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { listEvents } from "@/lib/api/events";
import {
  getTeamPerformanceResults,
  type RoundMark,
  type TeamPerformanceResponse,
  type TeamPerformanceStudentRow,
  type TeamPerformanceTeamGroup,
} from "@/lib/api/results";
import { ApiError } from "@/lib/api/client";
import { downloadCsvSections } from "@/lib/csv";
import { PROVINCE_OPTIONS, type Province } from "@/lib/domain";
import { useClubs } from "@/lib/hooks/use-clubs";
import { useIsClubMode } from "@/lib/hooks/use-grouping-mode";

/** A province (School mode) or club (Club mode) bucket, in one shape. */
type ResultGroup = { key: string; label: string; teams: TeamPerformanceTeamGroup[] };

const toGroups = (data: TeamPerformanceResponse | undefined): ResultGroup[] =>
  !data
    ? []
    : data.groupBy === "CLUB"
      ? data.clubs.map((c) => ({ key: c.clubId, label: c.clubName, teams: c.teams }))
      : data.provinces.map((p) => ({ key: p.province, label: p.provinceLabel, teams: p.teams }));

// Team Performance only ever scores round 1 (see wad-judging-be result-service.ts
// `getTeamPerformanceResults` — it fetches with `onlyRoundOne: true`), so a
// student's `marks` array here has at most one entry.
const roundOneMark = (student: TeamPerformanceStudentRow): RoundMark | undefined => student.marks[0];

const markCell = (
  key: "d" | "e1" | "e2" | "e3" | "e4" | "p",
): NonNullable<TableProps<TeamPerformanceStudentRow>["columns"]>[number] => ({
  title: key.toUpperCase(),
  key,
  width: 56,
  align: "center",
  render: (_: unknown, student: TeamPerformanceStudentRow) => roundOneMark(student)?.[key].toFixed(2) ?? "—",
});

const columns: TableProps<TeamPerformanceStudentRow>["columns"] = [
  { title: "Rank", dataIndex: "rank", key: "rank", width: 56 },
  { title: "Id", dataIndex: "code", key: "code", width: 72 },
  { title: "Name", dataIndex: "fullName", key: "fullName", width: 160, ellipsis: true },
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
    width: 72,
    align: "center",
    className: "bg-blue-50",
    render: (score: number) => <span className="font-bold text-blue-700">{score.toFixed(2)}</span>,
  },
];

export const TeamPerformanceTab = () => {
  const [eventId, setEventId] = useState<string | null>(null);
  // Province code (School mode) or clubId (Club mode).
  const [groupKey, setGroupKey] = useState<string | null>(null);
  const isClubMode = useIsClubMode();
  const clubs = useClubs({ enabled: isClubMode });
  const groupNoun = isClubMode ? "club" : "province";

  const eventsQuery = useQuery({ queryKey: ["events"], queryFn: () => listEvents() });
  const selectedEvent = eventsQuery.data?.find((e) => e.id === eventId) ?? null;

  const resultsQuery = useQuery({
    queryKey: ["results", "team-performance", eventId, isClubMode],
    queryFn: () => getTeamPerformanceResults(eventId!),
    enabled: Boolean(eventId),
  });

  const allGroups = toGroups(resultsQuery.data);
  // The province/club filter is optional: with one picked, show just that group.
  const groups = groupKey ? allGroups.filter((g) => g.key === groupKey) : allGroups;
  const isClubResult = resultsQuery.data?.groupBy === "CLUB";

  // Only students counted toward the team total are shown (already ranked
  // highest first). School mode caps that at the top 5; Club mode counts
  // every student in the club + team, so there's no cutoff.
  const countedFor = (group: ResultGroup, team: "A" | "B") => {
    const counted = (group.teams.find((t) => t.team === team)?.students ?? []).filter(
      (s) => s.countedTowardTotal,
    );
    return isClubResult ? counted : counted.slice(0, 5);
  };
  const totalFor = (group: ResultGroup, team: "A" | "B") =>
    group.teams.find((t) => t.team === team)?.teamTotal ?? 0;
  const groupHeader = isClubResult ? "Club" : "Province";

  const canExport = groups.length > 0;

  const handleExport = () => {
    if (!selectedEvent || groups.length === 0) return;
    const suffix = groupKey ? `-${groups[0].label}` : "";
    downloadCsvSections(`team-performance-${selectedEvent.name}${suffix}.csv`, [
      {
        title: "Team Performance",
        headers: [groupHeader, "Team", "Rank", "Id", "Name", "D", "E1", "E2", "E3", "E4", "P", "Score"],
        rows: groups.flatMap((group) =>
          (["A", "B"] as const).flatMap((team) =>
            countedFor(group, team).map((s) => {
              const mark = roundOneMark(s);
              return [
                group.label,
                `Team ${team}`,
                s.rank,
                s.code,
                s.fullName,
                mark?.d.toFixed(2) ?? "",
                mark?.e1.toFixed(2) ?? "",
                mark?.e2.toFixed(2) ?? "",
                mark?.e3.toFixed(2) ?? "",
                mark?.e4.toFixed(2) ?? "",
                mark?.p.toFixed(2) ?? "",
                s.finalScore.toFixed(2),
              ];
            }),
          ),
        ),
      },
      {
        title: "Team Totals",
        headers: [groupHeader, "Team", "Total"],
        rows: groups.flatMap((group) =>
          (["A", "B"] as const).map((team) => [group.label, `Team ${team}`, totalFor(group, team).toFixed(2)]),
        ),
      },
    ], {
      type: "Team Performance",
      eventName: selectedEvent.name,
      gender: selectedEvent.gender,
      province: !isClubResult && groupKey ? (groupKey as Province) : null,
      club: isClubResult && groupKey ? groups[0].label : null,
    });
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
      ) : groups.length === 0 ? (
        <Empty
          description={
            groupKey
              ? `No marks recorded for this ${groupNoun} yet`
              : "No marks recorded for this event yet"
          }
        />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.key} className="overflow-hidden rounded-xl border border-slate-200">
              {!groupKey ? (
                <div className="border-b border-slate-200 bg-slate-100 px-4 py-2">
                  <h3 className="text-sm font-semibold text-slate-800">{group.label}</h3>
                </div>
              ) : null}
              <div className="grid gap-4 p-4">
                {(["A", "B"] as const).map((team) => (
                  <div key={team} className="min-w-0">
                    <h4 className="mb-2 text-sm font-semibold text-slate-700">
                      Team {team}
                      {isClubResult ? "" : " — Top 5"}
                    </h4>
                    <Table<TeamPerformanceStudentRow>
                      columns={columns}
                      dataSource={countedFor(group, team)}
                      rowKey="studentId"
                      size="small"
                      pagination={false}
                      scroll={{ x: "max-content" }}
                    />
                    <div className="mt-2 flex items-center justify-between rounded-lg border-2 border-blue-200 bg-blue-50 px-4 py-2">
                      <span className="text-sm font-semibold text-blue-900">Team Total</span>
                      <span className="text-xl font-bold text-blue-700">
                        {totalFor(group, team).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
