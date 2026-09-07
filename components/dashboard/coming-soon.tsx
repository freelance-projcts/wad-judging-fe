import { RAINBOW_BAR } from "@/constants/brand";

export const ComingSoon = ({ title }: { title: string }) => {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-3 py-24 text-center">
      <div
        className="h-1.5 w-16 rounded-full"
        style={{ backgroundImage: RAINBOW_BAR }}
      />
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="text-slate-500">This section is coming soon.</p>
    </div>
  );
};
