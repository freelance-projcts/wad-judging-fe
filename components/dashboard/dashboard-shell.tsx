"use client";

import { App, Drawer } from "antd";
import {
  BarChartOutlined,
  BellOutlined,
  CalendarOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";

import ROUTES from "@/constants/routes";
import { NAV_ITEMS, RAINBOW_BAR, SIDEBAR_GRADIENT } from "@/constants/brand";

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
  { label: "Team", href: ROUTES.TEAM, icon: TeamOutlined },
  { label: "Results", href: ROUTES.RESULTS, icon: BarChartOutlined },
  { label: "Notifications", href: ROUTES.NOTIFICATIONS, icon: BellOutlined },
];

const isActive = (pathname: string, item: Pick<NavItem, "href" | "exact">) =>
  item.exact ? pathname === item.href : pathname.startsWith(item.href);

type SidebarProps = { onNavigate?: () => void };

const Sidebar = ({ onNavigate }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { modal } = App.useApp();

  const linkClass = (active: boolean) =>
    [
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
      active
        ? "bg-white/15 font-semibold text-[color:var(--nav-fg-active)]"
        : "text-[color:var(--nav-fg)] hover:bg-white/10 hover:text-[color:var(--nav-fg-hover)]",
    ].join(" ");

  const handleLogout = () => {
    modal.confirm({
      title: "Log out?",
      content: "You will need to sign in again to continue.",
      okText: "Log out",
      cancelText: "Stay",
      onOk: () => router.push(ROUTES.LOGIN),
    });
  };

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
      <div className="flex flex-col items-center gap-3 px-6 pb-6 pt-7 text-center">
        {/* TODO: swap for the provided logo, e.g. <Image src="/logo.png" ... /> */}
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-lg font-bold tracking-tight">
          WJ
        </div>
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
        {NAV.map(({ label, href, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={linkClass(isActive(pathname, { href, exact }))}
          >
            <Icon />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer actions */}
      <div className="space-y-1 border-t border-white/10 px-3 py-3">
        <Link
          href={ROUTES.PROFILE}
          onClick={onNavigate}
          className={linkClass(isActive(pathname, { href: ROUTES.PROFILE }))}
        >
          <UserOutlined />
          <span>Profile</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className={`${linkClass(false)} w-full`}
        >
          <LogoutOutlined />
          <span>Logout</span>
        </button>
      </div>
    </div>
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
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <MenuOutlined />
          </button>
          <span className="font-semibold text-slate-800">WAD Judging</span>
        </header>

        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
};
