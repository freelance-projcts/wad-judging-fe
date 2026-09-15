"use client";

import { App, Button, Form, Input } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import ROUTES from "@/constants/routes";
import { BRAND } from "@/constants/brand";
import { AuthShell } from "@/components/auth/auth-shell";
import { login } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { CURRENT_USER_QUERY_KEY } from "@/lib/hooks/use-current-user";

type LoginValues = {
  email: string;
  password: string;
};

const LoginFeature = () => {
  const { message } = App.useApp();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<LoginValues>();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: LoginValues) => {
    setSubmitting(true);
    try {
      await login(values);
      await queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
      message.success("Signed in successfully.");
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      message.error(
        err instanceof ApiError ? err.message : "Invalid email or password.",
      );
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
