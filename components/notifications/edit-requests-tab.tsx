"use client";

import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Alert, App, Button, Empty, Space, Spin, Table, Tag, type TableProps } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";

import { listEditRequests, resolveEditRequest, type EditRequest } from "@/lib/api/edit-requests";
import { ApiError } from "@/lib/api/client";

const statusColor: Record<EditRequest["status"], string> = {
  PENDING: "gold",
  APPROVED: "green",
  REJECTED: "red",
};

export const EditRequestsTab = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const requestsQuery = useQuery({
    queryKey: ["edit-requests"],
    queryFn: listEditRequests,
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) =>
      resolveEditRequest(id, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["edit-requests"] });
      message.success(status === "APPROVED" ? "Edit request approved." : "Edit request rejected.");
    },
    onError: (err) =>
      message.error(err instanceof ApiError ? err.message : "Could not update the request."),
  });

  const requests = requestsQuery.data ?? [];

  const columns: TableProps<EditRequest>["columns"] = [
    {
      title: "Requested By",
      dataIndex: ["requester", "name"],
      key: "requester",
    },
    {
      title: "Student",
      key: "student",
      render: (_, r) => r.markEntry.student.fullName,
    },
    {
      title: "Event",
      key: "event",
      render: (_, r) => `${r.markEntry.event.name} (Round ${r.markEntry.round})`,
    },
    {
      title: "Performance",
      key: "performance",
      render: (_, r) => r.markEntry.performance.name,
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (reason: string | null) => reason || <span className="text-slate-400">—</span>,
    },
    {
      title: "Requested At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: string) => dayjs(createdAt).format("DD MMM YYYY, HH:mm"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: EditRequest["status"]) => <Tag color={statusColor[status]}>{status}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, r) =>
        r.status === "PENDING" ? (
          <Space>
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              loading={resolveMutation.isPending && resolveMutation.variables?.id === r.id}
              onClick={() => resolveMutation.mutate({ id: r.id, status: "APPROVED" })}
            >
              Approve
            </Button>
            <Button
              size="small"
              danger
              icon={<CloseOutlined />}
              loading={resolveMutation.isPending && resolveMutation.variables?.id === r.id}
              onClick={() => resolveMutation.mutate({ id: r.id, status: "REJECTED" })}
            >
              Reject
            </Button>
          </Space>
        ) : (
          <span className="text-xs text-slate-400">
            {r.resolvedAt ? dayjs(r.resolvedAt).format("DD MMM YYYY, HH:mm") : "—"}
          </span>
        ),
    },
  ];

  if (requestsQuery.isError) {
    return (
      <Alert
        type="error"
        showIcon
        message="Could not load edit requests."
        description={
          requestsQuery.error instanceof ApiError ? requestsQuery.error.message : undefined
        }
      />
    );
  }

  if (requestsQuery.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spin />
      </div>
    );
  }

  if (requests.length === 0) {
    return <Empty description="No edit requests yet" />;
  }

  return (
    <Table<EditRequest>
      columns={columns}
      dataSource={requests}
      rowKey="id"
      size="small"
      scroll={{ x: "max-content" }}
    />
  );
};
