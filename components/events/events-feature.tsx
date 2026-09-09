"use client";

import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Popconfirm,
  Space,
  Table,
  Tag,
  type TableProps,
} from "antd";
import { useState } from "react";

import { EventDrawer } from "./event-drawer";
import {
  MOCK_EVENTS,
  eventGenderLabel,
  nextEventId,
  type EventFormValues,
  type EventGender,
  type WadEvent,
} from "./types";

const GENDER_TAG_COLOR: Record<EventGender, string> = {
  MALE: "blue",
  FEMALE: "magenta",
  MIXED: "gold",
};

export const EventsFeature = () => {
  const { message } = App.useApp();

  const [events, setEvents] = useState<WadEvent[]>(MOCK_EVENTS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<WadEvent | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (event: WadEvent) => {
    setEditing(event);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditing(null);
  };

  const handleSubmit = (values: EventFormValues) => {
    if (editing) {
      setEvents((prev) =>
        prev.map((e) => (e.id === editing.id ? { ...e, ...values } : e)),
      );
      message.success("Event updated.");
    } else {
      setEvents((prev) => [{ id: nextEventId(prev), ...values }, ...prev]);
      setPage(1);
      message.success("Event added.");
    }
    closeDrawer();
  };

  const handleDelete = (event: WadEvent) => {
    setEvents((prev) => prev.filter((e) => e.id !== event.id));
    message.success(`Removed ${event.name}.`);
  };

  const columns: TableProps<WadEvent>["columns"] = [
    { title: "Id", dataIndex: "id", key: "id", width: 140 },
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
      title: "Actions",
      key: "actions",
      width: 96,
      render: (_, event) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(event)}
          />
          <Popconfirm
            title="Remove this event?"
            description={event.name}
            okText="Remove"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(event)}
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
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Event</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Toolbar */}
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

        {/* Table */}
        <div className="mt-5">
          <Table<WadEvent>
            columns={columns}
            dataSource={events}
            rowKey="id"
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
        </div>
      </div>

      <EventDrawer
        open={drawerOpen}
        event={editing}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
