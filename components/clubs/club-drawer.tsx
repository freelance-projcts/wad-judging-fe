"use client";

import { Button, Drawer, Form, Input } from "antd";
import { useEffect } from "react";

import type { Club, ClubInput } from "@/lib/api/clubs";

type ClubDrawerProps = {
  open: boolean;
  /** The club being edited, or null when adding a new one. */
  club: Club | null;
  onClose: () => void;
  onSubmit: (values: ClubInput) => void;
  submitting?: boolean;
};

export const ClubDrawer = ({
  open,
  club,
  onClose,
  onSubmit,
  submitting,
}: ClubDrawerProps) => {
  const [form] = Form.useForm<ClubInput>();
  const isEdit = club !== null;

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue({ name: club?.name ?? "" });
  }, [open, club, form]);

  return (
    <Drawer
      title={isEdit ? "Edit Club" : "Add Club"}
      width={440}
      open={open}
      onClose={onClose}
      destroyOnHidden
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" loading={submitting} onClick={form.submit}>
            {isEdit ? "Save" : "Create"}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={(values) => onSubmit({ name: values.name.trim() })}
      >
        <Form.Item
          name="name"
          label="Club name"
          rules={[
            { required: true, whitespace: true, message: "Club name is required." },
            { max: 100, message: "Club name must be 100 characters or fewer." },
          ]}
        >
          <Input placeholder="Colombo Gymnastics Club" autoFocus />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
