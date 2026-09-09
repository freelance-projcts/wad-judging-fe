"use client";

import { Button, Drawer, Form, Input, Select } from "antd";
import { useEffect } from "react";

import {
  EVENT_GENDER_OPTIONS,
  type EventFormValues,
  type WadEvent,
} from "./types";

type EventDrawerProps = {
  open: boolean;
  /** Row being edited, or null when creating. */
  event: WadEvent | null;
  onClose: () => void;
  onSubmit: (values: EventFormValues) => void;
};

const DEFAULTS: EventFormValues = {
  name: "",
  gender: "MALE",
};

export const EventDrawer = ({
  open,
  event,
  onClose,
  onSubmit,
}: EventDrawerProps) => {
  const [form] = Form.useForm<EventFormValues>();
  const isEdit = Boolean(event);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue(
      event ? { name: event.name, gender: event.gender } : DEFAULTS,
    );
  }, [open, event, form]);

  return (
    <Drawer
      title={isEdit ? "Edit Event" : "Add Event"}
      width={440}
      open={open}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={form.submit}>
            {isEdit ? "Save changes" : "Create"}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={DEFAULTS}
        onFinish={onSubmit}
      >
        <Form.Item
          name="name"
          label="Event name"
          rules={[{ required: true, message: "Event name is required." }]}
        >
          <Input placeholder="Floor Exercise" autoFocus />
        </Form.Item>

        <Form.Item
          name="gender"
          label="Gender"
          rules={[{ required: true, message: "Please select a gender." }]}
        >
          <Select options={EVENT_GENDER_OPTIONS} placeholder="Select a gender" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
