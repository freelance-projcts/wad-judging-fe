"use client";

import { DownloadOutlined, FilterOutlined, UpOutlined } from "@ant-design/icons";
import { Alert, Button, Input, Spin, Table, type TableProps } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { listEvents, type WadEvent } from "@/lib/api/events";
import { listStudents, type Student } from "@/lib/api/students";
import { ApiError } from "@/lib/api/client";
import { downloadCsv } from "@/lib/csv";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

const MARKS_PLACEHOLDER = "—";

type Filters = { id?: string; name?: string };

export const AllRoundsTab = () => {
  const [filters, setFilters] = useState<Filters>({});
  const [filtersOpen, setFiltersOpen] = useState(false);

  // The backend only exposes a single `search` term matched against both
  // name and id, so when both filters are filled in, the Id one wins.
  const search = useDebouncedValue(filters.id || filters.name || "", 350);

  const eventsQuery = useQuery({ queryKey: ["events"], queryFn: () => listEvents() });
  const events = eventsQuery.data ?? [];

  const studentsQuery = useQuery({
    queryKey: ["results", "all-rounds", search],
    queryFn: () => listStudents({ search: search || undefined, pageSize: 1000 }),
  });

  const students = studentsQuery.data?.items ?? [];

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const columns: TableProps<Student>["columns"] = [
    { title: "Id", dataIndex: "code", key: "code", fixed: "left" },
    { title: "Player Name", dataIndex: "fullName", key: "fullName", fixed: "left" },
    ...events.map((event: WadEvent) => ({
      title: event.name,
      key: event.id,
      align: "center" as const,
      render: () => MARKS_PLACEHOLDER,
    })),
    {
      title: "Total",
      key: "total",
      align: "center" as const,
      fixed: "right" as const,
      render: () => MARKS_PLACEHOLDER,
    },
  ];

  const handleExport = () => {
    downloadCsv(
      "all-rounds.csv",
      ["Id", "Player Name", ...events.map((e) => e.name), "Total"],
      students.map((s) => [
        s.code,
        s.fullName,
        ...events.map(() => MARKS_PLACEHOLDER),
        MARKS_PLACEHOLDER,
      ]),
    );
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Button icon={<FilterOutlined />} onClick={() => setFiltersOpen((v) => !v)}>
          Filter
          <UpOutlined
            className="ml-1 transition-transform duration-200"
            style={{
              fontSize: 10,
              transform: filtersOpen ? "rotate(0deg)" : "rotate(180deg)",
            }}
          />
        </Button>

        <Button
          icon={<DownloadOutlined />}
          className="ml-auto"
          disabled={students.length === 0}
          onClick={handleExport}
        >
          Export CSV
        </Button>
      </div>

      {/* Filter panel */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: filtersOpen ? 200 : 0, opacity: filtersOpen ? 1 : 0 }}
      >
        <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Id</span>
            <Input
              allowClear
              placeholder="Search id"
              className="w-48"
              value={filters.id ?? ""}
              onChange={(e) => updateFilter("id", e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Name</span>
            <Input
              allowClear
              placeholder="Search name"
              className="w-48"
              value={filters.name ?? ""}
              onChange={(e) => updateFilter("name", e.target.value)}
            />
          </label>

          <Button className="ml-auto" onClick={() => setFilters({})}>
            Reset
          </Button>
        </div>
      </div>

      {studentsQuery.isError ? (
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
          loading={studentsQuery.isFetching}
          scroll={{ x: "max-content" }}
        />
      )}
    </div>
  );
};
