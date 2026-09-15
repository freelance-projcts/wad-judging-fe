"use client";

import {
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
  UpOutlined,
} from "@ant-design/icons";
import {
  Alert,
  App,
  Button,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  type TableProps,
} from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { PlayerDrawer } from "./player-drawer";
import {
  PROVINCE_OPTIONS,
  TEAM_OPTIONS,
  genderLabel,
  provinceLabel,
  teamLabel,
  type Gender,
  type Player,
  type PlayerFormValues,
  type Province,
  type Team,
} from "./types";
import {
  createStudent,
  deleteStudent,
  listStudents,
  updateStudent,
} from "@/lib/api/students";
import { ApiError } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

type Filters = {
  name?: string;
  id?: string;
  team?: Team;
  province?: Province;
};

const INITIAL_FILTERS: Filters = {};
const STUDENTS_QUERY_KEY = "students";

export const PlayersFeature = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const { data: profile } = useCurrentUser();
  const isAdmin = profile?.user.role === "ADMIN";

  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);

  // The backend only exposes a single `search` term matched against both
  // name and id, so when both filters are filled in, the Id one wins.
  const search = useDebouncedValue(filters.id || filters.name || "", 350);

  const studentsQuery = useQuery({
    queryKey: [
      STUDENTS_QUERY_KEY,
      { page, pageSize, search, team: filters.team, province: filters.province },
    ],
    queryFn: () =>
      listStudents({
        page,
        pageSize,
        search: search || undefined,
        team: filters.team,
        province: filters.province,
      }),
    placeholderData: (previous) => previous,
  });

  const invalidateStudents = () =>
    queryClient.invalidateQueries({ queryKey: [STUDENTS_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      invalidateStudents();
      setPage(1);
      message.success("Player added.");
      closeDrawer();
    },
    onError: (err) =>
      message.error(
        err instanceof ApiError ? err.message : "Could not add player.",
      ),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: PlayerFormValues }) =>
      updateStudent(id, values),
    onSuccess: () => {
      invalidateStudents();
      message.success("Player updated.");
      closeDrawer();
    },
    onError: (err) =>
      message.error(
        err instanceof ApiError ? err.message : "Could not update player.",
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => invalidateStudents(),
    onError: (err) =>
      message.error(
        err instanceof ApiError ? err.message : "Could not remove player.",
      ),
  });

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (player: Player) => {
    setEditing(player);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditing(null);
  };

  const handleSubmit = (values: PlayerFormValues) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleDelete = (player: Player) => {
    deleteMutation.mutate(player.id, {
      onSuccess: () => message.success(`Removed ${player.fullName}.`),
    });
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const columns: TableProps<Player>["columns"] = [
    { title: "Id", dataIndex: "code", key: "code" },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Team",
      dataIndex: "team",
      key: "team",
      render: (team: Team | null) => (
        <Tag color={team ? "blue" : "default"}>{teamLabel(team)}</Tag>
      ),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      render: (gender: Gender) => genderLabel(gender),
    },
    {
      title: "Province",
      dataIndex: "province",
      key: "province",
      render: (province: Province) => provinceLabel(province),
    },
    ...(isAdmin
      ? [
          {
            title: "Actions",
            key: "actions",
            width: 96,
            render: (_: unknown, player: Player) => (
              <Space>
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => openEdit(player)}
                />
                <Popconfirm
                  title="Remove this player?"
                  description={player.fullName}
                  okText="Remove"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => handleDelete(player)}
                >
                  <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  const players = studentsQuery.data?.items ?? [];
  const total = studentsQuery.data?.total ?? 0;

  return (
    <div className="mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Players</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            icon={<FilterOutlined />}
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

          {isAdmin ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="ml-auto"
              onClick={openCreate}
            >
              Add Player
            </Button>
          ) : null}
        </div>

        {/* Filter panel */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: filtersOpen ? 320 : 0,
            opacity: filtersOpen ? 1 : 0,
          }}
        >
          <div className="mt-3 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
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
              <span className="text-xs font-medium text-slate-600">Team</span>
              <Select
                allowClear
                placeholder="All teams"
                className="w-53"
                options={TEAM_OPTIONS}
                value={filters.team}
                onChange={(team) => updateFilter("team", team)}
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

            <Button className="ml-auto" onClick={resetFilters}>
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
            <Table<Player>
              columns={columns}
              dataSource={players}
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
                showTotal: (t, range) =>
                  `Showing ${range[0]}–${range[1]} of ${t} players`,
              }}
            />
          )}
        </div>
      </div>

      {isAdmin ? (
        <PlayerDrawer
          open={drawerOpen}
          player={editing}
          onClose={closeDrawer}
          onSubmit={handleSubmit}
          submitting={createMutation.isPending || updateMutation.isPending}
        />
      ) : null}
    </div>
  );
};
