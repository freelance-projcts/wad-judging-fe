"use client";

import {
  ArrowLeftOutlined,
  FilterOutlined,
  FormOutlined,
  SendOutlined,
  UpOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Empty,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  type TableProps,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { AddMarkModal } from "./add-mark-modal";
import { EventCard } from "./event-card";
import { SendEditRequestModal } from "./send-edit-request-modal";
import {
  GENDER_OPTIONS,
  PROVINCE_OPTIONS,
  genderLabel,
  provinceLabel,
  teamLabel,
  type Gender,
  type Province,
  type Student,
} from "./types";
import { listEvents } from "@/lib/api/events";
import { listStudents } from "@/lib/api/students";
import { listPerformances } from "@/lib/api/performances";
import { ApiError } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/hooks/use-current-user";

type Filters = { gender?: Gender; province?: Province };

export const MarksFeature = () => {
  const { data: profile } = useCurrentUser();
  const isAdmin = profile?.user.role === "ADMIN";

  // Admins pick from every performance; judges only ever see the ones
  // they've been granted (GET /profile already returns those for free).
  const performancesQuery = useQuery({
    queryKey: ["performances"],
    queryFn: listPerformances,
    enabled: isAdmin,
  });
  const availablePerformances = (isAdmin ? performancesQuery.data : profile?.performances) ?? [];

  // No default worth persisting through an effect: fall back to the first
  // available performance until the user (if there's more than one) picks one.
  const [performanceOverride, setPerformanceOverride] = useState<string | null>(null);
  const performanceId = performanceOverride ?? availablePerformances[0]?.id ?? null;

  const eventsQuery = useQuery({ queryKey: ["events"], queryFn: () => listEvents() });
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const selectedEvent = eventsQuery.data?.find((e) => e.id === selectedEventId) ?? null;

  const [filters, setFilters] = useState<Filters>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // A freshly-picked event defaults the gender filter to its own gender —
  // events are gender-specific, so this is almost always what's wanted. Adjusted
  // during render (not an effect) so it takes effect before the students query fires.
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  if (selectedEventId !== lastEventId) {
    setLastEventId(selectedEventId);
    setFilters(selectedEvent ? { gender: selectedEvent.gender } : {});
    setPage(1);
  }

  const [markStudent, setMarkStudent] = useState<Student | null>(null);
  const [editRequestStudent, setEditRequestStudent] = useState<Student | null>(null);

  const studentsQuery = useQuery({
    queryKey: ["students", { page, pageSize, gender: filters.gender, province: filters.province }],
    queryFn: () =>
      listStudents({
        page,
        pageSize,
        gender: filters.gender,
        province: filters.province,
      }),
    enabled: Boolean(selectedEvent),
    placeholderData: (previous) => previous,
  });

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const columns: TableProps<Student>["columns"] = [
    { title: "Id", dataIndex: "code", key: "code" },
    {
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      render: (gender: Gender) => genderLabel(gender),
    },
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
      render: (province: Province) => provinceLabel(province),
    },
    {
      title: "Actions",
      key: "actions",
      width: isAdmin ? 96 : 140,
      render: (_: unknown, student: Student) => (
        <Space>
          <Tooltip title="Add Marks">
            <Button
              type="text"
              size="small"
              disabled={!performanceId}
              icon={<FormOutlined />}
              onClick={() => setMarkStudent(student)}
            />
          </Tooltip>
          {!isAdmin ? (
            <Tooltip title="Send Edit Request">
              <Button
                type="text"
                size="small"
                disabled={!performanceId}
                icon={<SendOutlined />}
                onClick={() => setEditRequestStudent(student)}
              />
            </Tooltip>
          ) : null}
        </Space>
      ),
    },
  ];

  const students = studentsQuery.data?.items ?? [];
  const total = studentsQuery.data?.total ?? 0;

  return (
    <div className="mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Add Marks</h1>

        {availablePerformances.length > 1 ? (
          <label className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Performance</span>
            <Select
              className="w-56"
              placeholder="Select performance"
              value={performanceId ?? undefined}
              onChange={setPerformanceOverride}
              options={availablePerformances
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((p) => ({ label: p.name, value: p.id }))}
            />
          </label>
        ) : null}
      </div>

      {isAdmin && !performancesQuery.isLoading && availablePerformances.length === 0 ? (
        <Alert type="warning" showIcon message="No performances exist yet." />
      ) : null}
      {!isAdmin && profile && availablePerformances.length === 0 ? (
        <Alert
          type="warning"
          showIcon
          message="You have not been assigned to a performance yet. Contact an admin."
        />
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {!selectedEvent ? (
          <>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Select an event</h2>
            {eventsQuery.isError ? (
              <Alert
                type="error"
                showIcon
                message="Could not load events."
                description={
                  eventsQuery.error instanceof ApiError ? eventsQuery.error.message : undefined
                }
              />
            ) : eventsQuery.isLoading ? (
              <div className="flex justify-center py-10">
                <Spin />
              </div>
            ) : (eventsQuery.data ?? []).length === 0 ? (
              <Empty description="No events yet" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {eventsQuery.data!.map((event) => (
                  <EventCard
                    key={event.id}
                    name={event.name}
                    gender={event.gender}
                    onClick={() => setSelectedEventId(event.id)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <Button icon={<ArrowLeftOutlined />} onClick={() => setSelectedEventId(null)}>
                Back to events
              </Button>
              <h2 className="text-base font-semibold text-slate-800">{selectedEvent.name}</h2>
              <Button
                icon={<FilterOutlined />}
                className="ml-auto"
                onClick={() => setFiltersOpen((v) => !v)}
              >
                Filter
                <UpOutlined
                  className="ml-1 transition-transform duration-200"
                  style={{
                    fontSize: 10,
                    transform: filtersOpen ? "rotate(0deg)" : "rotate(180deg)",
                  }}
                />
              </Button>
            </div>

            {/* Filter panel */}
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: filtersOpen ? 200 : 0, opacity: filtersOpen ? 1 : 0 }}
            >
              <div className="mt-3 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
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
                    className="w-53"
                    options={PROVINCE_OPTIONS}
                    value={filters.province}
                    onChange={(province) => updateFilter("province", province)}
                  />
                </label>

                <Button
                  className="ml-auto"
                  onClick={() => {
                    setFilters({ gender: selectedEvent.gender });
                    setPage(1);
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="mt-5">
              {studentsQuery.isError ? (
                <Alert
                  type="error"
                  showIcon
                  message="Could not load players."
                  description={
                    studentsQuery.error instanceof ApiError
                      ? studentsQuery.error.message
                      : undefined
                  }
                />
              ) : (
                <Table<Student>
                  columns={columns}
                  dataSource={students}
                  rowKey="id"
                  loading={studentsQuery.isFetching}
                  scroll={{ x: "max-content" }}
                  pagination={{
                    current: page,
                    pageSize,
                    total,
                    showSizeChanger: true,
                    onChange: (nextPage, nextPageSize) => {
                      setPage(nextPage);
                      setPageSize(nextPageSize);
                    },
                    showTotal: (t, range) => `Showing ${range[0]}–${range[1]} of ${t} players`,
                  }}
                />
              )}
            </div>
          </>
        )}
      </div>

      {selectedEvent && performanceId ? (
        <>
          <AddMarkModal
            open={Boolean(markStudent)}
            student={markStudent}
            event={selectedEvent}
            performanceId={performanceId}
            canEditSubmitted={Boolean(isAdmin)}
            onClose={() => setMarkStudent(null)}
          />
          <SendEditRequestModal
            open={Boolean(editRequestStudent)}
            student={editRequestStudent}
            event={selectedEvent}
            performanceId={performanceId}
            onClose={() => setEditRequestStudent(null)}
          />
        </>
      ) : null}
    </div>
  );
};
