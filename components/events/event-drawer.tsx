"use client";

import { Button, Checkbox, Drawer, Form, Input, Select, Space } from "antd";
import { useEffect } from "react";

import {
  EVENT_GENDER_OPTIONS,
  type EventFormValues,
} from "./types";

type EventDrawerProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: EventFormValues) => void;
  submitting?: boolean;
};

const DEFAULTS: EventFormValues = {
  name: "",
  gender: "MALE",
  supportsMultipleRounds: false,
};

type RoundsToggleProps = {
  value?: boolean;
  onChange?: (value: boolean) => void;
};

const RoundsToggle = ({ value = false, onChange }: RoundsToggleProps) => (
  <Space size="large">
    <Checkbox checked={!value} onChange={() => onChange?.(false)}>
      Single round
    </Checkbox>
    <Checkbox checked={value} onChange={() => onChange?.(true)}>
      Multiple rounds
    </Checkbox>
  </Space>
);

export const EventDrawer = ({
  open,
  onClose,
  onSubmit,
  submitting,
}: EventDrawerProps) => {
  const [form] = Form.useForm<EventFormValues>();

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue(DEFAULTS);
  }, [open, form]);

  return (
    <Drawer
      title="Add Event"
      width={440}
      open={open}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" loading={submitting} onClick={form.submit}>
            Create
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

        <Form.Item name="supportsMultipleRounds" label="Rounds">
          <RoundsToggle />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
