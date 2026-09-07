"use client";

import { Typography } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";

import { BRAND, BRAND_GRADIENT, RAINBOW_BAR } from "@/constants/brand";

const { Title, Text } = Typography;

const FEATURES = [
  "Streamlined student evaluations",
  "Real-time performance tracking",
  "Consistent, bias-free scoring",
];

type AuthShellProps = {
  title: string;
  subtitle: string;
  /** Small link shown in the top-right corner on large screens. */
  topRight?: ReactNode;
  /** Line shown centered below the form (e.g. the opposite auth action). */
  footer?: ReactNode;
  /** Width of the form column. Defaults to a single-column width. */
  contentClassName?: string;
  children: ReactNode;
};

export const AuthShell = ({
  title,
  subtitle,
  topRight,
  footer,
  contentClassName = "max-w-sm",
  children,
}: AuthShellProps) => {
  return (
    <div className="w-full bg-white text-slate-900 lg:flex lg:min-h-dvh">
      {/* Promo panel — hidden on mobile */}
      <section
        className="relative hidden overflow-hidden p-12 text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-between"
        style={{ backgroundImage: BRAND_GRADIENT }}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl" />

        <span className="relative text-sm font-semibold tracking-[0.2em] text-white/90">
          WAD JUDGING
        </span>

        <div className="relative max-w-md">
          <div
            className="h-1.5 w-28 rounded-full"
            style={{ backgroundImage: RAINBOW_BAR }}
          />
          <h2 className="mt-6 text-4xl font-bold leading-tight">
            Welcome to WAD Judging
          </h2>
          <p className="mt-4 text-lg text-white/85">
            The ultimate tool for streamlined student evaluations and performance
            tracking.
          </p>

          <ul className="mt-8 space-y-3">
            {FEATURES.map((item, i) => (
              <li key={item} className="flex items-center gap-3 text-white/90">
                <CheckCircleOutlined
                  className="text-lg"
                  style={{ color: BRAND.rainbow[i % BRAND.rainbow.length] }}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <span className="relative text-sm text-white/70">
          &copy; {new Date().getFullYear()} WAD Judging. All rights reserved.
        </span>
      </section>

      {/* Form panel */}
      <section className="relative flex w-full items-center justify-center px-4 py-10 sm:py-12 lg:w-1/2 lg:py-8">
        {topRight ? (
          <p className="absolute right-6 top-6 hidden text-sm text-slate-500 lg:block">
            {topRight}
          </p>
        ) : null}

        <div className={`w-full ${contentClassName}`}>
          <div className="mb-8 text-center lg:hidden">
            <span
              className="text-xs font-semibold tracking-[0.2em]"
              style={{ color: BRAND.primary }}
            >
              WAD JUDGING
            </span>
            <h1 className="mt-2 text-2xl font-bold">Welcome to WAD Judging</h1>
            <p className="mt-1 text-sm text-slate-500">
              The ultimate tool for streamlined student evaluations and
              performance tracking.
            </p>
          </div>

          <div
            className="h-1.5 w-20 rounded-full"
            style={{ backgroundImage: RAINBOW_BAR }}
          />
          <Title level={2} style={{ marginTop: 16, marginBottom: 4 }}>
            {title}
          </Title>
          <Text type="secondary">{subtitle}</Text>

          <div className="mt-6">{children}</div>

          {footer ? (
            <p className="mt-6 text-center text-sm text-slate-500">{footer}</p>
          ) : null}
        </div>
      </section>
    </div>
  );
};
