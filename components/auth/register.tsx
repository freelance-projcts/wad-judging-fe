"use client";

import { App, Button, ConfigProvider, Form, Input } from "antd";
import { LockOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import ROUTES from "@/constants/routes";
import { BRAND } from "@/constants/brand";
import { AuthShell } from "@/components/auth/auth-shell";
import { register } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

type RegisterValues = {
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// Public self-registration always creates a JUDGE account — the backend
// enforces this too, so there's no role to pick here.
const RegisterFeature = () => {
  const { message } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm<RegisterValues>();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: RegisterValues) => {
    setSubmitting(true);
    try {
      await register({
        name: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
        email: values.email,
        password: values.password,
        mobileNumber: values.mobile,
      });
      message.success("Account created. Please sign in.");
      router.push(ROUTES.LOGIN);
    } catch (err) {
      message.error(
        err instanceof ApiError
          ? err.message
          : "Could not create your account. Please try again.",
      );
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
                  // Matches the backend's mobileNumber validation exactly.
                  pattern: /^[0-9+\-\s]{7,15}$/,
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
