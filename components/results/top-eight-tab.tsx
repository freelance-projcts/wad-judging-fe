"use client";

import { DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, Empty, Select, Spin, Table, Tag, type TableProps } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { listEvents } from "@/lib/api/events";
import { getTopEightResults, type RoundMark, type TopEightStudentRow } from "@/lib/api/results";
import { ApiError } from "@/lib/api/client";
import { downloadCsv } from "@/lib/csv";
import { PROVINCE_OPTIONS, teamLabel, type Province } from "@/lib/domain";
import { toOverallTopEightRanking, type OverallRankedRow } from "@/lib/results-ranking";

type FlatRow = OverallRankedRow<TopEightStudentRow>;

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
  { title: "Province", dataIndex: "provinceLabel", key: "provinceLabel", width: 120 },
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
  const [province, setProvince] = useState<Province | null>(null);

  const eventsQuery = useQuery({ queryKey: ["events"], queryFn: () => listEvents() });
  const selectedEvent = eventsQuery.data?.find((e) => e.id === eventId) ?? null;

  const resultsQuery = useQuery({
    queryKey: ["results", "top-8", eventId],
    queryFn: () => getTopEightResults(eventId!),
    enabled: Boolean(eventId),
  });

  const allProvinces = resultsQuery.data?.provinces ?? [];
  // "Top 8" is a ranking across every province - always compute it from the
  // full, unfiltered set so a row's rank/highlight never shifts depending on
  // the province filter. The filter only narrows which rows are *shown*; once
  // it's applied there's no single-province "top 8" to highlight, so the
  // highlight is suppressed rather than recomputed for the subset.
  const rankedAll = toOverallTopEightRanking(allProvinces);
  const rows = province
    ? rankedAll.filter((r) => r.province === province).map((r) => ({ ...r, isTopEight: false }))
    : rankedAll;
  const canExport = rows.length > 0;

  const handleExport = () => {
    if (!resultsQuery.data) return;
    downloadCsv(
      `top-8-${resultsQuery.data.eventName}.csv`,
      ["Rank", "Id", "Name", "Province", "Team", "D", "E1", "E2", "E3", "E4", "P", "Score", "Top 8"],
      rows.map((r) => {
        const mark = roundOneMark(r);
        return [
          r.overallRank,
          r.code,
          r.fullName,
          r.provinceLabel,
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
        province,
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
              setProvince(null);
            }}
            options={(eventsQuery.data ?? []).map((e) => ({ label: e.name, value: e.id }))}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-600">Province (optional)</span>
          <Select
            allowClear
            className="w-53"
            placeholder="All provinces"
            disabled={!eventId}
            showSearch={{ optionFilterProp: "label" }}
            value={province ?? undefined}
            onChange={(value) => setProvince(value ?? null)}
            options={PROVINCE_OPTIONS}
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
            province ? "No marks recorded for this province yet" : "No marks recorded for this event yet"
          }
        />
      ) : (
        <Table<FlatRow>
          columns={columns}
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
