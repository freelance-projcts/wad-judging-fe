"use client";

import { App, Button, Form, Input } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useState } from "react";

import ROUTES from "@/constants/routes";
import { AuthShell, BRAND } from "@/components/auth/auth-shell";

type LoginValues = {
  email: string;
  password: string;
};

const LoginFeature = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<LoginValues>();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: LoginValues) => {
    setSubmitting(true);
    try {
      // TODO: replace with real API call, e.g.
      // await signIn({ email: values.email, password: values.password });
      await new Promise((resolve) => setTimeout(resolve, 900));
      message.success(`Signed in as ${values.email}`);
    } catch {
      message.error("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Sign In"
      subtitle="Enter your email and password to continue."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href={ROUTES.REGISTER}
            className="font-semibold hover:opacity-80"
            style={{ color: BRAND.primary }}
          >
            Sign up
          </Link>
        </>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        size="large"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Email is required." },
            { type: "email", message: "Enter a valid email address." },
          ]}
        >
          <Input
            variant="underlined"
            prefix={<MailOutlined className="text-slate-400" />}
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            autoFocus
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: "Password is required." },
            { min: 8, message: "Password must be at least 8 characters." },
          ]}
        >
          <Input.Password
            variant="underlined"
            prefix={<LockOutlined className="text-slate-400" />}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </Form.Item>

        <div className="mb-5 text-right">
          <a
            href="#"
            className="text-sm font-medium hover:opacity-80"
            style={{ color: BRAND.primary }}
          >
            Forgot password?
          </a>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          shape="round"
          block
          loading={submitting}
        >
          Sign In
        </Button>
      </Form>
    </AuthShell>
  );
};

export default LoginFeature;
