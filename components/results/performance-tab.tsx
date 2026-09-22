"use client";

import { DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, Empty, Select, Spin, Table, Tag, type TableProps } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { listEvents } from "@/lib/api/events";
import { getPerformanceTwoResults, type PerformanceTwoStudentRow } from "@/lib/api/results";
import { ApiError } from "@/lib/api/client";
import { downloadCsv } from "@/lib/csv";
import { teamLabel } from "@/lib/domain";

const columns: TableProps<PerformanceTwoStudentRow>["columns"] = [
  { title: "Rank", dataIndex: "rank", key: "rank", width: 64 },
  { title: "Id", dataIndex: "code", key: "code" },
  { title: "Name", dataIndex: "fullName", key: "fullName" },
  { title: "Province", dataIndex: "provinceLabel", key: "provinceLabel" },
  {
    title: "Team",
    dataIndex: "team",
    key: "team",
    render: (team: PerformanceTwoStudentRow["team"]) => (
      <Tag color={team ? "blue" : "default"}>{teamLabel(team)}</Tag>
    ),
  },
  {
    title: "Score",
    dataIndex: "finalScore",
    key: "finalScore",
    align: "center",
    render: (score: number) => score.toFixed(2),
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
      ["Rank", "Id", "Name", "Province", "Team", "Score"],
      results.map((s) => [
        s.rank,
        s.code,
        s.fullName,
        s.provinceLabel,
        teamLabel(s.team),
        s.finalScore.toFixed(2),
      ]),
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
