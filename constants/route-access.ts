import ROUTES from "./routes";

// Single source of truth for who can reach which dashboard route — read by
// both the sidebar (to hide links) and AuthGate (to actually enforce it).
export type RouteAccess = "all" | "admin" | "judge";

const ACCESS: [route: string, access: RouteAccess][] = [
  [ROUTES.DASHBOARD, "all"],
  [ROUTES.PLAYERS, "admin"],
  [ROUTES.EVENT, "admin"],
  [ROUTES.MARKS, "judge"],
  [ROUTES.TEAM, "admin"],
  [ROUTES.RESULTS, "all"],
  [ROUTES.NOTIFICATIONS, "admin"],
  [ROUTES.PROFILE, "all"],
];

export const canAccessRoute = (pathname: string, isAdmin: boolean): boolean => {
  const entry = ACCESS.find(([route]) => pathname.startsWith(route));
  if (!entry) return true;
  const [, access] = entry;
  return access === "all" || (access === "admin" ? isAdmin : !isAdmin);
};
