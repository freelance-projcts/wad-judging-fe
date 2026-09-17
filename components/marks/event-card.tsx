"use client";

import { CalendarOutlined } from "@ant-design/icons";

import { TINTS } from "@/constants/brand";
import { genderLabel, type Gender } from "./types";

// Reuses the app's existing tint tokens (navy/magenta/gold) instead of
// inventing new colors, so this matches the Gender tag elsewhere.
const GENDER_TINT: Record<Gender, (typeof TINTS)[number]> = {
  MALE: TINTS[0],
  FEMALE: TINTS[3],
  OTHER: TINTS[4],
};

type EventCardProps = {
  name: string;
  gender: Gender;
  onClick: () => void;
};

export const EventCard = ({ name, gender, onClick }: EventCardProps) => {
  const tint = GENDER_TINT[gender];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
    >
      <span
        className="grid h-12 w-12 place-items-center rounded-xl transition-transform group-hover:scale-110"
        style={{ backgroundColor: tint.bg }}
      >
        <CalendarOutlined style={{ color: tint.color, fontSize: 22 }} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-base font-semibold text-slate-800">{name}</p>
        <p className="mt-0.5 text-sm font-medium" style={{ color: tint.color }}>
          {genderLabel(gender)}
        </p>
      </div>
    </button>
  );
};
