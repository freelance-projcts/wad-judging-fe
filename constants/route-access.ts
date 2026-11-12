import ROUTES from "./routes";

// Single source of truth for who can reach which dashboard route — read by
// both the sidebar (to hide links) and AuthGate (to actually enforce it).
// "admin-club" = admin who signed in with the Club Tournament type selected.
export type RouteAccess = "all" | "admin" | "judge" | "admin-club";

const ACCESS: [route: string, access: RouteAccess][] = [
  [ROUTES.DASHBOARD, "all"],
  [ROUTES.PLAYERS, "admin"],
  [ROUTES.EVENT, "admin"],
  [ROUTES.CLUBS, "admin-club"],
  [ROUTES.MARKS, "judge"],
  [ROUTES.TEAM, "admin"],
  [ROUTES.RESULTS, "admin"],
  [ROUTES.NOTIFICATIONS, "admin"],
  [ROUTES.PROFILE, "all"],
];

export type AccessContext = { isAdmin: boolean; isClubMode: boolean };

export const canAccessRoute = (
  pathname: string,
  { isAdmin, isClubMode }: AccessContext,
): boolean => {
  const entry = ACCESS.find(([route]) => pathname.startsWith(route));
  if (!entry) return true;
  switch (entry[1]) {
    case "all":
      return true;
    case "admin":
      return isAdmin;
    case "judge":
      return !isAdmin;
    case "admin-club":
      return isAdmin && isClubMode;
  }
};
