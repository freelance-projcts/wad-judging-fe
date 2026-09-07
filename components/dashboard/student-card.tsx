"use client";

import { Avatar } from "antd";

import { TINTS } from "@/constants/brand";

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
};

type StudentCardProps = {
  name: string;
  score: number;
  /** Used only to vary the avatar tint. */
  index?: number;
};

export const StudentCard = ({ name, score, index = 0 }: StudentCardProps) => {
  const tint = TINTS[index % TINTS.length];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Avatar
        size={56}
        style={{
          backgroundColor: tint.bg,
          color: tint.color,
          fontWeight: 600,
        }}
      >
        {initials(name)}
      </Avatar>
      <p className="mt-3 truncate font-semibold text-slate-800">{name}</p>
      <p className="text-sm text-slate-400">{score}</p>
    </div>
  );
};
