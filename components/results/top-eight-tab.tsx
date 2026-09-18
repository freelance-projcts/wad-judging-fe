"use client";

import { DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, Empty, Select, Spin, Table, Tag, type TableProps } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { listEvents } from "@/lib/api/events";
import { listStudents } from "@/lib/api/students";
import { ApiError } from "@/lib/api/client";
import { downloadCsv } from "@/lib/csv";
import { provinceLabel, teamLabel } from "@/lib/domain";
import type { Student } from "@/lib/api/students";

const columns: TableProps<Student>["columns"] = [
  { title: "Id", dataIndex: "code", key: "code" },
  { title: "Name", dataIndex: "fullName", key: "fullName" },
  {
    title: "Team",
    dataIndex: "team",
    key: "team",
    render: (team: Student["team"]) => (
      <Tag color={team ? "blue" : "default"}>{teamLabel(team)}</Tag>
    ),
  },
  {
    title: "Province",
    dataIndex: "province",
    key: "province",
    render: (province: Student["province"]) => provinceLabel(province),
  },
];

export const TopEightTab = () => {
  const [eventId, setEventId] = useState<string | null>(null);

  const eventsQuery = useQuery({ queryKey: ["events"], queryFn: () => listEvents() });
  const selectedEvent = eventsQuery.data?.find((e) => e.id === eventId) ?? null;

  const studentsQuery = useQuery({
    queryKey: ["results", "top-8", eventId],
    queryFn: () => listStudents({ gender: selectedEvent?.gender, pageSize: 1000 }),
    enabled: Boolean(selectedEvent),
  });

  const students = studentsQuery.data?.items ?? [];
  const canExport = Boolean(selectedEvent) && students.length > 0;

  const handleExport = () => {
    if (!selectedEvent) return;
    downloadCsv(
      `top-8-${selectedEvent.name}.csv`,
      ["Id", "Name", "Team", "Province"],
      students.map((s) => [s.code, s.fullName, teamLabel(s.team), provinceLabel(s.province)]),
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
          disabled={!canExport}
          onClick={handleExport}
        >
          Export CSV
        </Button>
      </div>

      {!selectedEvent ? (
        <Empty description="Select an event to load results" />
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
        <Table<Student>
          columns={columns}
          dataSource={students}
          rowKey="id"
          size="small"
          pagination={false}
          scroll={{ x: "max-content" }}
        />
      )}
    </div>
  );
};
