"use client";

import { PlusOutlined } from "@ant-design/icons";
import { Alert, App, Button, Table, Tag, type TableProps } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { EventDrawer } from "./event-drawer";
import {
  eventGenderLabel,
  type EventFormValues,
  type EventGender,
  type WadEvent,
} from "./types";
import { createEvent, listEvents } from "@/lib/api/events";
import { ApiError } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/hooks/use-current-user";

const GENDER_TAG_COLOR: Record<EventGender, string> = {
  MALE: "blue",
  FEMALE: "magenta",
  OTHER: "gold",
};

const EVENTS_QUERY_KEY = ["events"] as const;

export const EventsFeature = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const { data: profile } = useCurrentUser();
  const isAdmin = profile?.user.role === "ADMIN";

  const eventsQuery = useQuery({
    queryKey: EVENTS_QUERY_KEY,
    queryFn: () => listEvents(),
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openCreate = () => {
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const invalidateEvents = () =>
    queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      invalidateEvents();
      setPage(1);
      message.success("Event added.");
      closeDrawer();
    },
    onError: (err) =>
      message.error(err instanceof ApiError ? err.message : "Could not add event."),
  });

  const handleSubmit = (values: EventFormValues) => {
    createMutation.mutate(values);
  };

  const columns: TableProps<WadEvent>["columns"] = [
    { title: "Id", dataIndex: "id", key: "id", ellipsis: true },
    {
      title: "Event name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: 140,
      render: (gender: EventGender) => (
        <Tag color={GENDER_TAG_COLOR[gender]}>{eventGenderLabel(gender)}</Tag>
      ),
    },
    {
      title: "Rounds",
      dataIndex: "supportsMultipleRounds",
      key: "supportsMultipleRounds",
      width: 140,
      render: (supportsMultipleRounds: boolean) => (
        <Tag color={supportsMultipleRounds ? "purple" : "default"}>
          {supportsMultipleRounds ? "Multiple rounds" : "Single round"}
        </Tag>
      ),
    },
  ];

  const events = eventsQuery.data ?? [];

  return (
    <div className="mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Event</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Toolbar */}
        {isAdmin ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="ml-auto"
              onClick={openCreate}
            >
              Add Event
            </Button>
          </div>
        ) : null}

        {/* Table */}
        <div className="mt-5">
          {eventsQuery.isError ? (
            <Alert
              type="error"
              showIcon
              message="Could not load events."
              description={
                eventsQuery.error instanceof ApiError
                  ? eventsQuery.error.message
                  : undefined
              }
            />
          ) : (
            <Table<WadEvent>
              columns={columns}
              dataSource={events}
              rowKey="id"
              loading={eventsQuery.isLoading}
              scroll={{ x: "max-content" }}
              pagination={{
                current: page,
                pageSize,
                total: events.length,
                showSizeChanger: true,
                onChange: (nextPage, nextPageSize) => {
                  setPage(nextPage);
                  setPageSize(nextPageSize);
                },
                showTotal: (total, range) =>
                  `Showing ${range[0]}–${range[1]} of ${total} events`,
              }}
            />
          )}
        </div>
      </div>

      {isAdmin ? (
        <EventDrawer
          open={drawerOpen}
          onClose={closeDrawer}
          onSubmit={handleSubmit}
          submitting={createMutation.isPending}
        />
      ) : null}
    </div>
  );
};
