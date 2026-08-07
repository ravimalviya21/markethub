import { useState } from "react";
import type { AppProps } from "next/app";
import { ConfigProvider, App as AntApp, ThemeConfig } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/styles/global.css";
import { SessionProvider } from "@/config/session";

const theme: ThemeConfig = {
  token: {
    colorPrimary: "#1677ff",
    borderRadius: 8,
  },
};

export default function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={theme}>
        <AntApp>
          <SessionProvider>
            <Component {...pageProps} />
          </SessionProvider>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
