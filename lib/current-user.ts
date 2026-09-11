// Placeholder until wired to the signed-in user / auth session.
export type CurrentUser = {
  fullName: string;
  mobile: string;
  email: string;
  role: string;
};

export const CURRENT_USER: CurrentUser = {
  fullName: "Nimal Perera",
  mobile: "+94 77 123 4567",
  email: "nimal.perera@wadjudging.lk",
  role: "Admin",
};

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
