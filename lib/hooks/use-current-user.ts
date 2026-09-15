import { useQuery } from "@tanstack/react-query";

import { getProfile } from "@/lib/api/auth";

export const CURRENT_USER_QUERY_KEY = ["current-user"] as const;

/** The signed-in user (+ assigned performances), or an error when logged out. */
export const useCurrentUser = () =>
  useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: getProfile,
    retry: false,
  });
