"use client";

import { App, Button, ConfigProvider, Form, Input, Radio, Select } from "antd";
import { LockOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useState } from "react";

import ROUTES from "@/constants/routes";
import { AuthShell, BRAND } from "@/components/auth/auth-shell";

type Role = "SUPERVISOR" | "ADMIN";
type Team = "TEAM_A" | "TEAM_B";

type RegisterValues = {
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
  team: Team;
};

const ROLE_OPTIONS = [
  { label: "Supervisor", value: "SUPERVISOR" },
  { label: "Admin", value: "ADMIN" },
];

const TEAM_OPTIONS = [
  { label: "Team A", value: "TEAM_A" },
  { label: "Team B", value: "TEAM_B" },
];

const RegisterFeature = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<RegisterValues>();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: RegisterValues) => {
    setSubmitting(true);
    try {
      // TODO: replace with real API call, e.g.
      // await register({ ...values, confirmPassword: undefined });
      await new Promise((resolve) => setTimeout(resolve, 900));
      message.success(`Account created for ${values.email}`);
    } catch {
      message.error("Could not create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Fill in your details to get started."
      contentClassName="max-w-xl"
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={ROUTES.LOGIN}
            className="font-semibold hover:opacity-80"
            style={{ color: BRAND.primary }}
          >
            Sign in
          </Link>
        </>
      }
    >
      {/* Tighter vertical rhythm so the whole form fits without scrolling on desktop */}
      <ConfigProvider
        theme={{
          components: {
            Form: { itemMarginBottom: 14, verticalLabelPadding: "0 0 2px" },
          },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={onFinish}
          size="middle"
          scrollToFirstError
        >
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Form.Item
              name="firstName"
              label="First name"
              rules={[{ required: true, message: "First name is required." }]}
            >
              <Input placeholder="Jane" autoComplete="given-name" autoFocus />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Last name"
              rules={[{ required: true, message: "Last name is required." }]}
            >
              <Input placeholder="Doe" autoComplete="family-name" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Form.Item
              name="mobile"
              label="Mobile"
              rules={[
                { required: true, message: "Mobile number is required." },
                {
                  pattern: /^[0-9+\-\s()]{7,20}$/,
                  message: "Enter a valid mobile number.",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined className="text-slate-400" />}
                placeholder="+94 71 234 5678"
                autoComplete="tel"
                inputMode="tel"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Email is required." },
                { type: "email", message: "Enter a valid email address." },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-slate-400" />}
                placeholder="you@example.com"
                autoComplete="email"
                inputMode="email"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Password is required." },
                { min: 8, message: "Password must be at least 8 characters." },
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400" />}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm password"
              dependencies={["password"]}
              hasFeedback
              rules={[
                { required: true, message: "Please confirm your password." },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match."));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400" />}
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: "Please choose a role." }]}
            >
              <Radio.Group
                options={ROLE_OPTIONS}
                optionType="button"
                buttonStyle="solid"
              />
            </Form.Item>

            <Form.Item
              name="team"
              label="Team"
              rules={[{ required: true, message: "Please select a team." }]}
            >
              <Select options={TEAM_OPTIONS} placeholder="Select a team" />
            </Form.Item>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            shape="round"
            block
            loading={submitting}
            className="mt-2"
          >
            Create account
          </Button>
        </Form>
      </ConfigProvider>
    </AuthShell>
  );
};

export default RegisterFeature;
