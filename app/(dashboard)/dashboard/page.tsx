"use client";

import { BellOutlined, CalendarOutlined, TeamOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, Empty, Spin } from "antd";

import { StatCard } from "@/components/dashboard/stat-card";
import { PlayerCard } from "@/components/dashboard/player-card";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { getDashboardSummary } from "@/lib/api/dashboard";
import { listStudents } from "@/lib/api/students";
import { listEvents } from "@/lib/api/events";
import { listEditRequests } from "@/lib/api/edit-requests";

const RECENT_PLAYERS_PAGE_SIZE = 8;

const DashboardPage = () => {
  const { data: profile, isLoading: profileLoading } = useCurrentUser();
  const isAdmin = profile?.user.role === "ADMIN";

  const recentStudentsQuery = useQuery({
    queryKey: ["students", "recent"],
    queryFn: () => listStudents({ page: 1, pageSize: RECENT_PLAYERS_PAGE_SIZE }),
    enabled: Boolean(profile),
  });

  // GET /dashboard is admin-only; judges get their own equivalents instead.
  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
    enabled: isAdmin,
  });

  const eventsQuery = useQuery({
    queryKey: ["events", "count"],
    queryFn: () => listEvents(),
    enabled: Boolean(profile) && !isAdmin,
  });

  const editRequestsQuery = useQuery({
    queryKey: ["edit-requests", "own"],
    queryFn: listEditRequests,
    enabled: Boolean(profile) && !isAdmin,
  });

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (profileLoading || !profile) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  const totalEvents = isAdmin
    ? summaryQuery.data?.totalEvents
    : eventsQuery.data?.length;

  const pendingRequests = isAdmin
    ? summaryQuery.data?.pendingRequests.total
    : editRequestsQuery.data?.filter((r) => r.status === "PENDING").length;

  const stats = [
    {
      label: "Total Players",
      value: recentStudentsQuery.data?.total ?? 0,
      icon: TeamOutlined,
      color: "#1E40AF",
      bg: "#E7ECFA",
    },
    {
      label: "Total Events",
      value: totalEvents ?? 0,
      icon: CalendarOutlined,
      color: "#3EA845",
      bg: "#E8F5E9",
    },
    {
      label: "Pending Requests",
      value: pendingRequests ?? 0,
      icon: BellOutlined,
      color: "#EF7E1B",
      bg: "#FDF0E2",
    },
  ];

  const recentPlayers = recentStudentsQuery.data?.items ?? [];

  return (
    <div className="mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Welcome, {profile.user.name}
        </h1>
        <p className="mt-1 text-sm text-slate-500" suppressHydrationWarning>
          {today}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Recently Added Players
        </h2>

        {recentStudentsQuery.isLoading ? (
          <div className="flex justify-center py-10">
            <Spin />
          </div>
        ) : recentStudentsQuery.isError ? (
          <Alert type="error" showIcon message="Could not load recent players." />
        ) : recentPlayers.length === 0 ? (
          <Empty description="No players added yet" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recentPlayers.map((player, i) => (
              <PlayerCard
                key={player.id}
                index={i}
                name={player.fullName}
                subtitle={player.code}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
