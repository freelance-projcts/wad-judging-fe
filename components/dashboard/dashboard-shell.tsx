"use client";

import { App, Drawer, Popover } from "antd";
import {
  BarChartOutlined,
  BellOutlined,
  CalendarOutlined,
  DownOutlined,
  EditOutlined,
  HomeOutlined,
  IdcardOutlined,
  LogoutOutlined,
  MailOutlined,
  MenuOutlined,
  PhoneOutlined,
  TrophyOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";

import ROUTES from "@/constants/routes";
import { canAccessRoute } from "@/constants/route-access";
import {
  BRAND_GRADIENT,
  NAV_ITEMS,
  RAINBOW_BAR,
  SIDEBAR_GRADIENT,
} from "@/constants/brand";
import { initials } from "@/lib/current-user";
import { logout, roleLabel } from "@/lib/api/auth";
import { resetDatabase } from "@/lib/api/admins";
import { ApiError } from "@/lib/api/client";
import { CURRENT_USER_QUERY_KEY, useCurrentUser } from "@/lib/hooks/use-current-user";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { label: "Home", href: ROUTES.DASHBOARD, icon: HomeOutlined, exact: true },
  { label: "Players", href: ROUTES.PLAYERS, icon: TrophyOutlined },
  { label: "Event", href: ROUTES.EVENT, icon: CalendarOutlined },
  { label: "Add Marks", href: ROUTES.MARKS, icon: EditOutlined },
  { label: "Results", href: ROUTES.RESULTS, icon: BarChartOutlined },
  { label: "Notifications", href: ROUTES.NOTIFICATIONS, icon: BellOutlined },
];

const isActive = (pathname: string, item: Pick<NavItem, "href" | "exact">) =>
  item.exact ? pathname === item.href : pathname.startsWith(item.href);

const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { modal } = App.useApp();

  return () =>
    modal.confirm({
      title: "Log out?",
      content: "You will need to sign in again to continue.",
      okText: "Log out",
      cancelText: "Stay",
      onOk: async () => {
        try {
          await logout();
        } catch {
          // Session may already be gone server-side — clear it locally regardless.
        }
        queryClient.removeQueries({ queryKey: CURRENT_USER_QUERY_KEY });
        router.replace(ROUTES.LOGIN);
      },
    });
};

const useResetDb = () => {
  const queryClient = useQueryClient();
  const { modal, message } = App.useApp();

  return () =>
    modal.confirm({
      title: "Reset database?",
      icon: <WarningOutlined style={{ color: "#dc2626" }} />,
      content:
        "This will permanently erase every player, event, mark, and result. This cannot be undone.",
      okText: "Reset database",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await resetDatabase();
          await queryClient.invalidateQueries();
          message.success("Database has been reset.");
        } catch (err) {
          message.error(
            err instanceof ApiError ? err.message : "Could not reset the database.",
          );
        }
      },
    });
};

type SidebarProps = { onNavigate?: () => void };

const Sidebar = ({ onNavigate }: SidebarProps) => {
  const pathname = usePathname();
  const { data: profile } = useCurrentUser();
  const isAdmin = profile?.user.role === "ADMIN";
  const items = NAV.filter((item) => canAccessRoute(item.href, isAdmin));

  const linkClass = (active: boolean, bright = false) =>
    [
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
      bright ? "!text-white" : "",
      active
        ? "bg-white/15 font-semibold text-[color:var(--nav-fg-active)]"
        : bright
          ? "hover:bg-white/20 hover:!text-white"
          : "text-[color:var(--nav-fg)] hover:bg-white/10 hover:text-[color:var(--nav-fg-hover)]",
    ].join(" ");

  return (
    <div
      className="flex h-full flex-col text-white"
      style={
        {
          backgroundImage: SIDEBAR_GRADIENT,
          "--nav-fg": NAV_ITEMS.idle,
          "--nav-fg-hover": NAV_ITEMS.hover,
          "--nav-fg-active": NAV_ITEMS.active,
        } as CSSProperties
      }
    >
      {/* Brand */}
      <div className="flex flex-col items-center gap-3 px-4 pb-6 pt-10 text-center">
        <Image
          src="/logo-mark.png"
          alt="WAD Judging"
          width={131}
          height={123}
          priority
          unoptimized
          className="h-auto w-full max-w-[80px]"
        />
        <div>
          <p className="text-base font-bold leading-tight">WAD Judging</p>
          <div
            className="mx-auto mt-2 h-1 w-16 rounded-full"
            style={{ backgroundImage: RAINBOW_BAR }}
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {items.map(({ label, href, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={linkClass(isActive(pathname, { href, exact }), true)}
          >
            <Icon />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

type ProfileFieldRow = {
  label: string;
  value: string;
  icon: ComponentType<{ style?: CSSProperties }>;
};

const ProfileRow = ({ label, value, icon: Icon }: ProfileFieldRow) => (
  <div className="flex items-center gap-3 px-4 py-2.5">
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
      <Icon style={{ fontSize: 14 }} />
    </span>
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="truncate text-sm font-medium text-slate-800">{value}</p>
    </div>
  </div>
);

const ProfileCard = () => {
  const handleLogout = useLogout();
  const handleResetDb = useResetDb();
  const { data: profile } = useCurrentUser();
  const user = profile?.user;
  const isAdmin = user?.role === "ADMIN";

  const fields: ProfileFieldRow[] = [
    { label: "Mobile", value: user?.mobileNumber || "—", icon: PhoneOutlined },
    { label: "Email", value: user?.email ?? "", icon: MailOutlined },
    { label: "Role", value: user ? roleLabel(user.role) : "", icon: IdcardOutlined },
  ];

  return (
    <div className="w-72 overflow-hidden rounded-xl">
      <div
        className="flex items-center gap-3 px-4 py-4"
        style={{ backgroundImage: BRAND_GRADIENT }}
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-sm font-bold text-[#1E40AF] shadow">
          {initials(user?.name ?? "")}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {user?.name}
          </p>
          <p className="truncate text-xs text-white/75">{user?.email}</p>
        </div>
      </div>

      <div className="divide-y divide-slate-100 bg-white">
        {fields.map((field) => (
          <ProfileRow key={field.label} {...field} />
        ))}
      </div>

      <div className="border-t border-slate-100 bg-white p-2">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <LogoutOutlined />
          Logout
        </button>
        {isAdmin ? (
          <button
            type="button"
            onClick={handleResetDb}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <WarningOutlined />
            Reset Database
          </button>
        ) : null}
      </div>
    </div>
  );
};

const ProfileMenu = () => {
  const [open, setOpen] = useState(false);
  const { data: profile } = useCurrentUser();
  const user = profile?.user;

  return (
    <Popover
      content={<ProfileCard />}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      arrow={false}
      styles={{ content: { padding: 0, overflow: "hidden", borderRadius: 12 } }}
    >
      <button
        type="button"
        className={[
          "ml-auto flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 transition-colors",
          open ? "bg-slate-100" : "hover:bg-slate-100",
        ].join(" ")}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#E7ECFA] text-xs font-bold text-[#1E40AF]">
          {initials(user?.name ?? "")}
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-semibold text-slate-800">
            {user?.name}
          </span>
          <span className="block text-xs text-slate-500">
            {user ? roleLabel(user.role) : ""}
          </span>
        </span>
        <DownOutlined
          className={[
            "hidden transition-transform sm:block",
            open ? "rotate-180" : "",
          ].join(" ")}
          style={{ fontSize: 10, color: "#94a3b8" }}
        />
      </button>
    </Popover>
  );
};

export const DashboardShell = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 lg:block">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      <Drawer
        placement="left"
        width={256}
        open={open}
        onClose={() => setOpen(false)}
        closable={false}
        styles={{ body: { padding: 0 } }}
      >
        <Sidebar onNavigate={() => setOpen(false)} />
      </Drawer>

      {/* Content */}
      <div className="flex min-h-dvh flex-col lg:pl-64">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 shadow-lg shadow-slate-900/10 backdrop-blur">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <MenuOutlined />
          </button>
          <span className="font-semibold text-slate-800 lg:hidden">
            WAD Judging
          </span>
          <ProfileMenu />
        </header>

        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
};
