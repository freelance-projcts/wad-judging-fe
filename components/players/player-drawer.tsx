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
  submitting?: boolean;
};

const DEFAULTS: PlayerFormValues = {
  code: "",
  fullName: "",
  team: undefined,
  gender: "MALE",
  province: "WESTERN",
};

export const PlayerDrawer = ({
  open,
  player,
  onClose,
  onSubmit,
  submitting,
}: PlayerDrawerProps) => {
  const [form] = Form.useForm<PlayerFormValues>();
  const isEdit = Boolean(player);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue(
      player
        ? {
            code: player.code,
            fullName: player.fullName,
            team: player.team ?? undefined,
            gender: player.gender,
            province: player.province,
          }
        : DEFAULTS,
    );
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
          <Button type="primary" loading={submitting} onClick={form.submit}>
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
        // `team` must be sent as `null` (not omitted) when cleared, since
        // JSON.stringify drops `undefined` keys and the backend would then
        // read a cleared team as "no change" on PATCH instead of "unassign".
        onFinish={(values) => onSubmit({ ...values, team: values.team ?? null })}
      >
        <Form.Item
          name="code"
          label="Id"
          rules={[{ required: true, message: "Id is required." }]}
        >
          <Input placeholder="STU-0001" disabled={isEdit} autoFocus={!isEdit} />
        </Form.Item>

        <Form.Item
          name="fullName"
          label="Full name"
          rules={[{ required: true, message: "Full name is required." }]}
        >
          <Input placeholder="Jane Doe" />
        </Form.Item>

        <Form.Item name="team" label="Team">
          <Select
            options={TEAM_OPTIONS}
            placeholder="Unassigned"
            allowClear
          />
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
