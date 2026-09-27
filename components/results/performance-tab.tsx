"use client";

import { DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, Empty, Select, Spin, Table, Tag, type TableProps } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { listEvents } from "@/lib/api/events";
import {
  getPerformanceTwoResults,
  type PerformanceTwoStudentRow,
  type RoundMark,
} from "@/lib/api/results";
import { ApiError } from "@/lib/api/client";
import { downloadCsv } from "@/lib/csv";
import { teamLabel } from "@/lib/domain";

// A multi-round event's Score here can average round 1 and round 2 - the
// D/E1-E4/P breakdown columns still only show round 1's raw marks (same
// simplification as the Team Performance and Top 8 tabs).
const roundOneMark = (student: PerformanceTwoStudentRow): RoundMark | undefined => student.marks[0];

const markCell = (
  key: "d" | "e1" | "e2" | "e3" | "e4" | "p",
): NonNullable<TableProps<PerformanceTwoStudentRow>["columns"]>[number] => ({
  title: key.toUpperCase(),
  key,
  width: 56,
  align: "center",
  render: (_: unknown, student: PerformanceTwoStudentRow) => roundOneMark(student)?.[key].toFixed(2) ?? "—",
});

const columns: TableProps<PerformanceTwoStudentRow>["columns"] = [
  { title: "Rank", dataIndex: "rank", key: "rank", width: 64 },
  { title: "Id", dataIndex: "code", key: "code", width: 72 },
  { title: "Name", dataIndex: "fullName", key: "fullName", width: 160, ellipsis: true },
  { title: "Province", dataIndex: "provinceLabel", key: "provinceLabel", width: 120 },
  {
    title: "Team",
    dataIndex: "team",
    key: "team",
    width: 90,
    render: (team: PerformanceTwoStudentRow["team"]) => (
      <Tag color={team ? "blue" : "default"}>{teamLabel(team)}</Tag>
    ),
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
    render: (score: number) => <span className="font-bold text-blue-700">{score.toFixed(2)}</span>,
  },
];

export const PerformanceTab = () => {
  const [eventId, setEventId] = useState<string | null>(null);

  const eventsQuery = useQuery({ queryKey: ["events"], queryFn: () => listEvents() });
  const selectedEvent = eventsQuery.data?.find((e) => e.id === eventId) ?? null;

  const resultsQuery = useQuery({
    queryKey: ["results", "performance-two", eventId],
    queryFn: () => getPerformanceTwoResults(eventId!),
    enabled: Boolean(eventId),
  });

  const results = resultsQuery.data?.results ?? [];

  const handleExport = () => {
    if (!resultsQuery.data) return;
    downloadCsv(
      `performance-2-${resultsQuery.data.eventName}.csv`,
      ["Rank", "Id", "Name", "Province", "Team", "D", "E1", "E2", "E3", "E4", "P", "Score"],
      results.map((s) => {
        const mark = roundOneMark(s);
        return [
          s.rank,
          s.code,
          s.fullName,
          s.provinceLabel,
          teamLabel(s.team),
          mark?.d.toFixed(2) ?? "",
          mark?.e1.toFixed(2) ?? "",
          mark?.e2.toFixed(2) ?? "",
          mark?.e3.toFixed(2) ?? "",
          mark?.e4.toFixed(2) ?? "",
          mark?.p.toFixed(2) ?? "",
          s.finalScore.toFixed(2),
        ];
      }),
      {
        type: "Performance 2",
        eventName: resultsQuery.data.eventName,
        gender: selectedEvent?.gender,
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
            onChange={setEventId}
            options={(eventsQuery.data ?? []).map((e) => ({ label: e.name, value: e.id }))}
          />
        </label>

        <Button
          icon={<DownloadOutlined />}
          className="ml-auto"
          disabled={results.length === 0}
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
      ) : results.length === 0 ? (
        <Empty description="No marks recorded for this event yet" />
      ) : (
        <Table<PerformanceTwoStudentRow>
          columns={columns}
          dataSource={results}
          rowKey="studentId"
          size="small"
          pagination={false}
          scroll={{ x: "max-content" }}
        />
      )}
    </div>
  );
};
