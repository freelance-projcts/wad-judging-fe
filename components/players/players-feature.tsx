"use client";

import {
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
  UpOutlined,
} from "@ant-design/icons";
import {
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
import { useMemo, useState } from "react";

import { PlayerDrawer } from "./player-drawer";
import {
  MOCK_PLAYERS,
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

type Filters = {
  name?: string;
  id?: string;
  team?: Team;
  province?: Province;
};

const INITIAL_FILTERS: Filters = {};

export const PlayersFeature = () => {
  const { message } = App.useApp();

  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);

  const filtered = useMemo(() => {
    const name = filters.name?.trim().toLowerCase() ?? "";
    const id = filters.id?.trim().toLowerCase() ?? "";
    return players.filter((p) => {
      if (name && !p.name.toLowerCase().includes(name)) return false;
      if (id && !p.id.toLowerCase().includes(id)) return false;
      if (filters.team && p.team !== filters.team) return false;
      if (filters.province && p.province !== filters.province) return false;
      return true;
    });
  }, [players, filters]);

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
      setPlayers((prev) =>
        prev.map((p) => (p.id === editing.id ? { ...p, ...values } : p)),
      );
      message.success("Player updated.");
    } else {
      if (players.some((p) => p.id === values.id)) {
        message.error(`A player with Id "${values.id}" already exists.`);
        return;
      }
      setPlayers((prev) => [values, ...prev]);
      setPage(1);
      message.success("Player added.");
    }
    closeDrawer();
  };

  const handleDelete = (player: Player) => {
    setPlayers((prev) => prev.filter((p) => p.id !== player.id));
    message.success(`Removed ${player.name}.`);
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const columns: TableProps<Player>["columns"] = [
    { title: "Id", dataIndex: "id", key: "id" },
    {
      title: "Full Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Team",
      dataIndex: "team",
      key: "team",
      render: (team: Team) => <Tag color="blue">{teamLabel(team)}</Tag>,
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
    {
      title: "Actions",
      key: "actions",
      width: 96,
      render: (_, player) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(player)}
          />
          <Popconfirm
            title="Remove this player?"
            description={player.name}
            okText="Remove"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(player)}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

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

          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="ml-auto"
            onClick={openCreate}
          >
            Add Player
          </Button>
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
          <Table<Player>
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            scroll={{ x: "max-content" }}
            pagination={{
              current: page,
              pageSize,
              total: filtered.length,
              showSizeChanger: true,
              onChange: (nextPage, nextPageSize) => {
                setPage(nextPage);
                setPageSize(nextPageSize);
              },
              showTotal: (total, range) =>
                `Showing ${range[0]}–${range[1]} of ${total} players`,
            }}
          />
        </div>
      </div>

      <PlayerDrawer
        open={drawerOpen}
        player={editing}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
