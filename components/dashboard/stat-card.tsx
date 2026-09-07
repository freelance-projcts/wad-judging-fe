import type { ComponentType } from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: ComponentType<{ style?: React.CSSProperties }>;
  color: string;
  bg: string;
};

export const StatCard = ({ label, value, icon: Icon, color, bg }: StatCardProps) => {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span
        className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
        style={{ backgroundColor: bg }}
      >
        <Icon style={{ color, fontSize: 22 }} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
};
