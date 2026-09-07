// WAD Judging brand palette (derived from the logo)
export const BRAND = {
  primary: "#1E40AF", // navy blue — main app color
  primaryHover: "#2B54C6",
  rainbow: ["#E23B33", "#EF7E1B", "#F4C020", "#3EA845", "#2A5CA9"], // logo arc
} as const;

// Sidebar nav item label colors (independent of brandTheme)
export const NAV_ITEMS = {
  idle: "#ffffff",
  hover: "#ffffff",
  active: "#ffffff",
} as const;

// Horizontal rainbow accent bar (echoes the logo arc)
export const RAINBOW_BAR =
  "linear-gradient(90deg,#E23B33 0%,#EF7E1B 25%,#F4C020 50%,#3EA845 75%,#2A5CA9 100%)";

// Navy-blue gradients used on hero / navigation surfaces
export const BRAND_GRADIENT =
  "linear-gradient(135deg,#1E40AF 0%,#1A357F 45%,#122253 100%)";
export const SIDEBAR_GRADIENT =
  "linear-gradient(180deg,#1E40AF 0%,#182F6B 55%,#122253 100%)";

// Tinted {text, background} pairs for avatars / stat icons
export const TINTS = [
  { color: "#1E40AF", bg: "#E7ECFA" },
  { color: "#3EA845", bg: "#E8F5E9" },
  { color: "#EF7E1B", bg: "#FDF0E2" },
  { color: "#A61E7A", bg: "#F7E7F1" },
  { color: "#C98A04", bg: "#FEF6E0" },
  { color: "#E23B33", bg: "#FCEAE9" },
] as const;

// antd theme shared across the whole app (see components/layout/root-provider)
export const brandTheme = {
  token: {
    colorPrimary: BRAND.primary,
    colorLink: BRAND.primary,
    colorLinkHover: BRAND.primaryHover,
    borderRadius: 10,
    controlHeightLG: 48,
    fontSize: 15,
  },
  components: {
    Button: { fontWeight: 600 },
  },
};
