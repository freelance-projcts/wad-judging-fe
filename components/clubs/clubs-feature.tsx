"use client";

import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Alert, App, Button, Input, Table, Tooltip, type TableProps } from "antd";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";

import { ClubDrawer } from "./club-drawer";
import {
  createClub,
  deleteClub,
  listClubs,
  updateClub,
  type Club,
  type ClubInput,
} from "@/lib/api/clubs";
import { ApiError } from "@/lib/api/client";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { CLUBS_QUERY_KEY } from "@/lib/hooks/use-clubs";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof ApiError ? err.message : fallback;

export const ClubsFeature = () => {
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Club | null>(null);

  const clubsQuery = useQuery({
    queryKey: [...CLUBS_QUERY_KEY, debouncedSearch],
    queryFn: () => listClubs({ search: debouncedSearch }),
    placeholderData: keepPreviousData,
  });

  const invalidateClubs = () =>
    queryClient.invalidateQueries({ queryKey: CLUBS_QUERY_KEY });

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };
  const openEdit = (club: Club) => {
    setEditing(club);
    setDrawerOpen(true);
  };
  const closeDrawer = () => setDrawerOpen(false);

  const saveMutation = useMutation({
    mutationFn: (values: ClubInput) =>
      editing ? updateClub(editing.id, values) : createClub(values),
    onSuccess: () => {
      invalidateClubs();
      message.success(editing ? "Club updated." : "Club added.");
      if (!editing) setPage(1);
      closeDrawer();
    },
    onError: (err) =>
      message.error(
        errorMessage(err, editing ? "Could not update club." : "Could not add club."),
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: (club: Club) => deleteClub(club.id),
    onSuccess: () => {
      invalidateClubs();
      message.success("Club deleted.");
    },
    onError: (err) => message.error(errorMessage(err, "Could not delete club.")),
  });

  const confirmDelete = (club: Club) =>
    modal.confirm({
      title: "Delete this club?",
      content: `${club.name} will be removed. Clubs with students assigned cannot be deleted.`,
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      centered: true,
      onOk: () => deleteMutation.mutateAsync(club).catch(() => undefined),
    });

  const columns: TableProps<Club>["columns"] = [
    {
      title: "Club name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: formatDate,
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 160,
      render: formatDate,
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              aria-label={`Edit ${record.name}`}
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              aria-label={`Delete ${record.name}`}
              loading={
                deleteMutation.isPending &&
                deleteMutation.variables?.id === record.id
              }
              onClick={() => confirmDelete(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const clubs = clubsQuery.data ?? [];

  return (
    <div className="mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Club Management
        </h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <Input
            allowClear
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Search clubs"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full sm:!w-72"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="ml-auto"
            onClick={openCreate}
          >
            Add Club
          </Button>
        </div>

        {/* Table */}
        <div className="mt-5">
          {clubsQuery.isError ? (
            <Alert
              type="error"
              showIcon
              message="Could not load clubs."
              description={
                clubsQuery.error instanceof ApiError
                  ? clubsQuery.error.message
                  : undefined
              }
              action={
                <Button size="small" onClick={() => clubsQuery.refetch()}>
                  Retry
                </Button>
              }
            />
          ) : (
            <Table<Club>
              columns={columns}
              dataSource={clubs}
              rowKey="id"
              loading={clubsQuery.isFetching}
              scroll={{ x: "max-content" }}
              locale={{ emptyText: "No clubs found" }}
              pagination={{
                current: page,
                pageSize,
                total: clubs.length,
                showSizeChanger: true,
                onChange: (nextPage, nextPageSize) => {
                  setPage(nextPage);
                  setPageSize(nextPageSize);
                },
                showTotal: (total, range) =>
                  `Showing ${range[0]}–${range[1]} of ${total} clubs`,
              }}
            />
          )}
        </div>
      </div>

      <ClubDrawer
        open={drawerOpen}
        club={editing}
        onClose={closeDrawer}
        onSubmit={(values) => saveMutation.mutate(values)}
        submitting={saveMutation.isPending}
      />
    </div>
  );
};
