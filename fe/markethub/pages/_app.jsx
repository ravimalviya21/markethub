import { ConfigProvider, App as AntApp } from "antd";
import "@/styles/global.css";

const theme = {
  token: {
    colorPrimary: "#1677ff",
    borderRadius: 8,
  },
};

export default function MyApp({ Component, pageProps }) {
  return (
    <ConfigProvider theme={theme}>
      <AntApp>
        <Component {...pageProps} />
      </AntApp>
    </ConfigProvider>
  );
}
