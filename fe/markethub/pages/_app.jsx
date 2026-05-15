import { useState, useEffect } from "react";
import { ConfigProvider, App as AntApp } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/styles/global.css";
import axios, { setAccessToken } from "@/config/axios";

const theme = {
  token: {
    colorPrimary: "#1677ff",
    borderRadius: 8,
  },
};

export default function MyApp({ Component, pageProps }) {
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
  const [booted, setBooted] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.post("/auth/refresh-token");
        setAccessToken(data?.data?.accessToken ?? null);
      } catch {
        setAccessToken(null);
      } finally {
        setBooted(true);
      }
    })();
  }, []);

  if (!booted) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={theme}>
        <AntApp>
          <Component {...pageProps} />
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
