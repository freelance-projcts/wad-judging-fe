import type { QueryClientConfig } from "@tanstack/react-query";

export const reactQueryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
};
