"use client";

import { BellOutlined, CalendarOutlined, TeamOutlined } from "@ant-design/icons";

import { StatCard } from "@/components/dashboard/stat-card";
import { PlayerCard } from "@/components/dashboard/player-card";

// --- Mock data (replace with API results) ---
const USER_NAME = "Dilshan Piumika";

const STATS = [
  {
    label: "Total Players",
    value: 100,
    icon: TeamOutlined,
    color: "#1E40AF",
    bg: "#E7ECFA",
  },
  {
    label: "Total Events",
    value: 5,
    icon: CalendarOutlined,
    color: "#3EA845",
    bg: "#E8F5E9",
  },
  {
    label: "Pending Requests",
    value: 0,
    icon: BellOutlined,
    color: "#EF7E1B",
    bg: "#FDF0E2",
  },
];

const RECENT_PLAYERS = [
  { name: "K.M.D.N Bandara", score: 69 },
  { name: "L.S Jayakodi", score: 71 },
  { name: "A.A.S.J Amarasinghe", score: 70 },
  { name: "A.M.U.M Abekoon", score: 66 },
  { name: "W.G.S Sadewma", score: 65 },
  { name: "M.C Bandara", score: 62 },
  { name: "A.M.A.H Alahakoon", score: 61 },
  { name: "M.T Munasinghe", score: 60 },
];

const DashboardPage = () => {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Welcome, {USER_NAME}
        </h1>
        <p className="mt-1 text-sm text-slate-500" suppressHydrationWarning>
          {today}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Recently Added Players
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {RECENT_PLAYERS.map((player, i) => (
            <PlayerCard key={player.name} index={i} {...player} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
