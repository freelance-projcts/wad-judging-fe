"use client";

import { reactQueryConfig } from "@/lib/react-query";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App as AntdApp, ConfigProvider } from "antd";
import { useState } from "react";


export const RootProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient(reactQueryConfig));

  return (
    <QueryClientProvider client={queryClient}>
      <AntdRegistry>
        <ConfigProvider>
          <AntdApp notification={{ maxCount: 3 }}>
            {children}
          </AntdApp>
        </ConfigProvider>
      </AntdRegistry>
    </QueryClientProvider>
  );
};
