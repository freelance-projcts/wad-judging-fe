"use client";

import { Button, Drawer, Form, Input, Select } from "antd";
import { useEffect } from "react";

import {
  GENDER_OPTIONS,
  PROVINCE_OPTIONS,
  TEAM_OPTIONS,
  type Player,
  type PlayerFormValues,
} from "./types";

type PlayerDrawerProps = {
  open: boolean;
  /** Row being edited, or null when creating. */
  player: Player | null;
  onClose: () => void;
  onSubmit: (values: PlayerFormValues) => void;
};

const DEFAULTS: PlayerFormValues = {
  id: "",
  name: "",
  team: "TEAM_A",
  gender: "MALE",
  province: "WESTERN",
};

export const PlayerDrawer = ({
  open,
  player,
  onClose,
  onSubmit,
}: PlayerDrawerProps) => {
  const [form] = Form.useForm<PlayerFormValues>();
  const isEdit = Boolean(player);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue(player ?? DEFAULTS);
  }, [open, player, form]);

  return (
    <Drawer
      title={isEdit ? "Edit Player" : "Add Player"}
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
          name="id"
          label="Id"
          rules={[{ required: true, message: "Id is required." }]}
        >
          <Input placeholder="WAD-1001" disabled={isEdit} />
        </Form.Item>

        <Form.Item
          name="name"
          label="Full name"
          rules={[{ required: true, message: "Full name is required." }]}
        >
          <Input placeholder="Jane Doe" autoFocus />
        </Form.Item>

        <Form.Item
          name="team"
          label="Team"
          rules={[{ required: true, message: "Please select a team." }]}
        >
          <Select options={TEAM_OPTIONS} placeholder="Select a team" />
        </Form.Item>

        <Form.Item
          name="gender"
          label="Gender"
          rules={[{ required: true, message: "Please select a gender." }]}
        >
          <Select options={GENDER_OPTIONS} placeholder="Select a gender" />
        </Form.Item>

        <Form.Item
          name="province"
          label="Province"
          rules={[{ required: true, message: "Please select a province." }]}
        >
          <Select
            options={PROVINCE_OPTIONS}
            placeholder="Select a province"
            showSearch={{ optionFilterProp: "label" }}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
