import { useState } from "react";
import { ConfigProvider, App as AntApp } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/styles/global.css";

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
