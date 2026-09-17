"use client";

import { App, Button, Empty, Form, Input, Modal, Select, Spin } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { listMarks } from "@/lib/api/marks";
import { createEditRequest } from "@/lib/api/edit-requests";
import { ApiError } from "@/lib/api/client";
import type { Student, WadEvent } from "./types";

type SendEditRequestModalProps = {
  open: boolean;
  student: Student | null;
  event: WadEvent | null;
  performanceId: string;
  onClose: () => void;
};

type FormValues = { markEntryId: string; reason?: string };

export const SendEditRequestModal = ({
  open,
  student,
  event,
  performanceId,
  onClose,
}: SendEditRequestModalProps) => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<FormValues>();

  // Same query key as the Add Mark modal, so both share one cached fetch.
  const marksQuery = useQuery({
    queryKey: ["marks", performanceId, event?.id, student?.id],
    queryFn: () =>
      listMarks({ performanceId, eventId: event!.id, studentId: student!.id }),
    enabled: open && Boolean(event) && Boolean(student) && Boolean(performanceId),
  });

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form]);

  const mutation = useMutation({
    mutationFn: createEditRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["edit-requests"] });
      message.success("Edit request sent.");
      onClose();
    },
    onError: (err) =>
      message.error(
        err instanceof ApiError ? err.message : "Could not send edit request.",
      ),
  });

  const entries = marksQuery.data ?? [];

  return (
    <Modal
      title={student ? `Request Edit — ${student.fullName}` : "Request Edit"}
      open={open}
      onCancel={onClose}
      width={420}
      destroyOnHidden
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            loading={mutation.isPending}
            disabled={entries.length === 0}
            onClick={form.submit}
          >
            Send request
          </Button>
        </div>
      }
    >
      {event ? <p className="-mt-2 mb-4 text-sm text-slate-500">{event.name}</p> : null}

      {marksQuery.isLoading ? (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      ) : entries.length === 0 ? (
        <Empty description="No submitted marks yet for this student in this event." />
      ) : (
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={(values) =>
            mutation.mutate({
              markEntryId: values.markEntryId,
              reason: values.reason?.trim() || null,
            })
          }
        >
          <Form.Item
            name="markEntryId"
            label="Round"
            rules={[{ required: true, message: "Select which round you want to edit." }]}
          >
            <Select
              placeholder="Select a submitted round"
              options={entries.map((entry) => ({
                value: entry.id,
                label: `Round ${entry.round} — Final ${entry.finalScore}`,
              }))}
            />
          </Form.Item>

          <Form.Item name="reason" label="Reason (optional)">
            <Input.TextArea rows={3} placeholder="Why does this round need to change?" />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};
