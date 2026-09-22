"use client";

import { DownloadOutlined, FilterOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Input, Select, Spin, Table, type TableProps } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { getAllRounderResults, type AllRounderStudentRow } from "@/lib/api/results";
import { downloadCsv } from "@/lib/csv";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { GENDER_OPTIONS, PROVINCE_OPTIONS, TEAM_OPTIONS } from "@/lib/domain";
import type { Gender, Province, Team } from "@/lib/domain";

const MARKS_PLACEHOLDER = "—";

type Filters = { id?: string; name?: string; gender?: Gender; province?: Province; team?: Team };

export const AllRoundsTab = () => {
  const [filters, setFilters] = useState<Filters>({});
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = useDebouncedValue(filters.id || filters.name || "", 350);

  const resultsQuery = useQuery({
    queryKey: ["results", "all-rounds", filters.gender, filters.province, filters.team],
    queryFn: () =>
      getAllRounderResults({
        gender: filters.gender,
        province: filters.province,
        team: filters.team,
      }),
  });

  const events = resultsQuery.data?.events ?? [];
  const allStudents = resultsQuery.data?.students ?? [];
  const students = search
    ? allStudents.filter(
        (s) =>
          s.code.toLowerCase().includes(search.toLowerCase()) ||
          s.fullName.toLowerCase().includes(search.toLowerCase()),
      )
    : allStudents;

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const columns: TableProps<AllRounderStudentRow>["columns"] = [
    { title: "Rank", dataIndex: "rank", key: "rank", width: 64 },
    { title: "Id", dataIndex: "code", key: "code" },
    { title: "Player Name", dataIndex: "fullName", key: "fullName" },
    ...events.map((event) => ({
      title: event.name,
      key: event.id,
      align: "center" as const,
      render: (_: unknown, student: AllRounderStudentRow) => {
        const breakdown = student.events.find((e) => e.eventId === event.id);
        return breakdown?.hasMark ? breakdown.finalScore!.toFixed(2) : MARKS_PLACEHOLDER;
      },
    })),
    {
      title: "Total",
      key: "total",
      align: "center" as const,
      className: "bg-blue-50",
      render: (_: unknown, student: AllRounderStudentRow) => (
        <span className="font-bold text-blue-700">{student.totalScore.toFixed(2)}</span>
      ),
    },
  ];

  const handleExport = () => {
    downloadCsv(
      "all-rounders.csv",
      ["Rank", "Id", "Player Name", ...events.map((e) => e.name), "Total"],
      students.map((s) => [
        s.rank,
        s.code,
        s.fullName,
        ...events.map((event) => {
          const breakdown = s.events.find((e) => e.eventId === event.id);
          return breakdown?.hasMark ? breakdown.finalScore!.toFixed(2) : MARKS_PLACEHOLDER;
        }),
        s.totalScore.toFixed(2),
      ]),
      { type: "All Rounders", gender: filters.gender, province: filters.province },
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
        style={{ maxHeight: filtersOpen ? 240 : 0, opacity: filtersOpen ? 1 : 0 }}
      >
        <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Id</span>
            <Input
              allowClear
              placeholder="Search id"
              className="w-40"
              value={filters.id ?? ""}
              onChange={(e) => updateFilter("id", e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Name</span>
            <Input
              allowClear
              placeholder="Search name"
              className="w-40"
              value={filters.name ?? ""}
              onChange={(e) => updateFilter("name", e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Gender</span>
            <Select
              allowClear
              placeholder="All genders"
              className="w-40"
              options={GENDER_OPTIONS}
              value={filters.gender}
              onChange={(gender) => updateFilter("gender", gender)}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Province</span>
            <Select
              allowClear
              showSearch={{ optionFilterProp: "label" }}
              placeholder="All provinces"
              className="w-48"
              options={PROVINCE_OPTIONS}
              value={filters.province}
              onChange={(province) => updateFilter("province", province)}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Team</span>
            <Select
              allowClear
              placeholder="All teams"
              className="w-36"
              options={TEAM_OPTIONS}
              value={filters.team}
              onChange={(team) => updateFilter("team", team)}
            />
          </label>

          <Button className="ml-auto" onClick={() => setFilters({})}>
            Reset
          </Button>
        </div>
      </div>

      {resultsQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : (
        <Table<AllRounderStudentRow>
          columns={columns}
          dataSource={students}
          rowKey="studentId"
          size="small"
          loading={resultsQuery.isFetching}
          scroll={{ x: "max-content" }}
        />
      )}
    </div>
  );
};
