"use client";

import {
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ComponentType } from "react";

import { BRAND_GRADIENT } from "@/constants/brand";
import { CURRENT_USER, initials } from "@/lib/current-user";

type Field = {
  label: string;
  value: string;
  icon: ComponentType<{ style?: React.CSSProperties }>;
};

const DetailRow = ({ label, value, icon: Icon }: Field) => (
  <div className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/80">
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
      <Icon style={{ fontSize: 16 }} />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 break-words text-[15px] font-medium text-slate-800">
        {value}
      </p>
    </div>
  </div>
);

export const ProfileFeature = () => {
  const user = CURRENT_USER;

  const fields: Field[] = [
    { label: "Full Name", value: user.fullName, icon: UserOutlined },
    { label: "Mobile", value: user.mobile, icon: PhoneOutlined },
    { label: "Email", value: user.email, icon: MailOutlined },
    { label: "Role", value: user.role, icon: IdcardOutlined },
  ];

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Profile
      </h1>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.12)]">
        {/* Header */}
        <div className="relative px-6 pb-6 pt-7">
          <div
            className="absolute inset-x-0 top-0 h-24"
            style={{ backgroundImage: BRAND_GRADIENT }}
          />
          <div className="relative flex items-end gap-4">
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-white text-xl font-bold text-[#1E40AF] shadow-md ring-1 ring-slate-200">
              {initials(user.fullName)}
            </span>
            <div className="pb-1">
              <p className="text-lg font-semibold leading-tight text-slate-900">
                {user.fullName}
              </p>
              <p className="mt-1 text-sm text-slate-500">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="divide-y divide-slate-100 border-t border-slate-100">
          {fields.map((field) => (
            <DetailRow key={field.label} {...field} />
          ))}
        </div>
      </div>
    </div>
  );
};
