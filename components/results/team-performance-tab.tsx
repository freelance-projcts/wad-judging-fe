"use client";

import { DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, Empty, Select, Spin, Table, type TableProps } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { listEvents } from "@/lib/api/events";
import { listStudents } from "@/lib/api/students";
import { ApiError } from "@/lib/api/client";
import { downloadCsv } from "@/lib/csv";
import { PROVINCE_OPTIONS, provinceLabel, type Province } from "@/lib/domain";
import type { Student } from "@/lib/api/students";
import type { Team } from "@/lib/domain";

const MARKS_PLACEHOLDER = "—";

const columns: TableProps<Student>["columns"] = [
  { title: "Id", dataIndex: "code", key: "code" },
  { title: "Name", dataIndex: "fullName", key: "fullName" },
  {
    title: "Marks",
    key: "marks",
    render: () => MARKS_PLACEHOLDER,
  },
];

export const TeamPerformanceTab = () => {
  const [eventId, setEventId] = useState<string | null>(null);
  const [province, setProvince] = useState<Province | null>(null);

  const eventsQuery = useQuery({ queryKey: ["events"], queryFn: () => listEvents() });
  const selectedEvent = eventsQuery.data?.find((e) => e.id === eventId) ?? null;

  const studentsQuery = useQuery({
    queryKey: ["results", "team-performance", eventId, province],
    queryFn: () =>
      listStudents({
        gender: selectedEvent?.gender,
        province: province!,
        pageSize: 1000,
      }),
    enabled: Boolean(selectedEvent) && Boolean(province),
  });

  const students = studentsQuery.data?.items ?? [];
  const byTeam = (team: Team) => students.filter((s) => s.team === team);
  const canExport = Boolean(selectedEvent) && Boolean(province) && students.length > 0;

  const handleExport = () => {
    if (!selectedEvent || !province) return;
    downloadCsv(
      `team-performance-${selectedEvent.name}-${provinceLabel(province)}.csv`,
      ["Team", "Id", "Name", "Marks"],
      (["A", "B"] as Team[]).flatMap((team) =>
        byTeam(team).map((s) => [`Team ${team}`, s.code, s.fullName, MARKS_PLACEHOLDER]),
      ),
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
          <span className="text-xs font-medium text-slate-600">Province</span>
          <Select
            className="w-53"
            placeholder="Select province"
            disabled={!selectedEvent}
            showSearch={{ optionFilterProp: "label" }}
            value={province ?? undefined}
            onChange={setProvince}
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

      {!selectedEvent || !province ? (
        <Empty description="Select an event and a province to load results" />
      ) : studentsQuery.isError ? (
        <Alert
          type="error"
          showIcon
          message="Could not load players."
          description={
            studentsQuery.error instanceof ApiError ? studentsQuery.error.message : undefined
          }
        />
      ) : studentsQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Team A</h3>
            <Table<Student>
              columns={columns}
              dataSource={byTeam("A")}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ x: "max-content" }}
            />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Team B</h3>
            <Table<Student>
              columns={columns}
              dataSource={byTeam("B")}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ x: "max-content" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
