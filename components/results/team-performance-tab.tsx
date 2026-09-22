"use client";

import { DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, Empty, Select, Spin, Table, type TableProps } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { listEvents } from "@/lib/api/events";
import {
  getTeamPerformanceResults,
  type TeamPerformanceProvinceGroup,
  type TeamPerformanceStudentRow,
} from "@/lib/api/results";
import { ApiError } from "@/lib/api/client";
import { downloadCsvSections } from "@/lib/csv";
import { PROVINCE_OPTIONS, type Province } from "@/lib/domain";

const columns: TableProps<TeamPerformanceStudentRow>["columns"] = [
  { title: "Rank", dataIndex: "rank", key: "rank", width: 64 },
  { title: "Id", dataIndex: "code", key: "code" },
  { title: "Name", dataIndex: "fullName", key: "fullName" },
  {
    title: "Score",
    dataIndex: "finalScore",
    key: "finalScore",
    align: "center",
    render: (score: number) => score.toFixed(2),
  },
];

export const TeamPerformanceTab = () => {
  const [eventId, setEventId] = useState<string | null>(null);
  const [province, setProvince] = useState<Province | null>(null);

  const eventsQuery = useQuery({ queryKey: ["events"], queryFn: () => listEvents() });
  const selectedEvent = eventsQuery.data?.find((e) => e.id === eventId) ?? null;

  const resultsQuery = useQuery({
    queryKey: ["results", "team-performance", eventId],
    queryFn: () => getTeamPerformanceResults(eventId!),
    enabled: Boolean(eventId),
  });

  const allGroups = resultsQuery.data?.provinces ?? [];
  // Province is optional: with one picked, show just that province; otherwise show every province.
  const groups = province ? allGroups.filter((p) => p.province === province) : allGroups;

  // Only the top 5 (already ranked top-to-bottom, highest score first) count
  // toward the team total - the rest are excluded from this view entirely.
  const top5For = (group: TeamPerformanceProvinceGroup, team: "A" | "B") =>
    (group.teams.find((t) => t.team === team)?.students ?? [])
      .filter((s) => s.countedTowardTotal)
      .slice(0, 5);
  const totalFor = (group: TeamPerformanceProvinceGroup, team: "A" | "B") =>
    group.teams.find((t) => t.team === team)?.teamTotal ?? 0;

  const canExport = groups.length > 0;

  const handleExport = () => {
    if (!selectedEvent || groups.length === 0) return;
    const suffix = province ? `-${groups[0].provinceLabel}` : "";
    downloadCsvSections(`team-performance-${selectedEvent.name}${suffix}.csv`, [
      {
        title: "Team Performance",
        headers: ["Province", "Team", "Rank", "Id", "Name", "Score"],
        rows: groups.flatMap((group) =>
          (["A", "B"] as const).flatMap((team) =>
            top5For(group, team).map((s) => [
              group.provinceLabel,
              `Team ${team}`,
              s.rank,
              s.code,
              s.fullName,
              s.finalScore.toFixed(2),
            ]),
          ),
        ),
      },
      {
        title: "Team Totals",
        headers: ["Province", "Team", "Total"],
        rows: groups.flatMap((group) =>
          (["A", "B"] as const).map((team) => [group.provinceLabel, `Team ${team}`, totalFor(group, team).toFixed(2)]),
        ),
      },
    ]);
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
      ) : groups.length === 0 ? (
        <Empty
          description={
            province ? "No marks recorded for this province yet" : "No marks recorded for this event yet"
          }
        />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.province} className="overflow-hidden rounded-xl border border-slate-200">
              {!province ? (
                <div className="border-b border-slate-200 bg-slate-100 px-4 py-2">
                  <h3 className="text-sm font-semibold text-slate-800">{group.provinceLabel}</h3>
                </div>
              ) : null}
              <div className="grid gap-4 p-4 lg:grid-cols-2">
                {(["A", "B"] as const).map((team) => (
                  <div key={team} className="min-w-0">
                    <h4 className="mb-2 text-sm font-semibold text-slate-700">
                      Team {team} — Top 5
                    </h4>
                    <Table<TeamPerformanceStudentRow>
                      columns={columns}
                      dataSource={top5For(group, team)}
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
