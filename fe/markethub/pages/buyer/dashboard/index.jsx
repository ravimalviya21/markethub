import { useRouter } from "next/router";
import { Layout, Typography } from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  HeartOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

import Header from "@/components/layout/Header";

const { Content } = Layout;
const { Title, Text } = Typography;

export default function BuyerDashboardPage() {
  const router = useRouter();

  const profileMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "My Profile",
      onClick: () => router.push("/buyer/profile"),
    },
    {
      key: "orders",
      icon: <ShoppingOutlined />,
      label: "My Orders",
      onClick: () => router.push("/buyer/orders"),
    },
    {
      key: "wishlist",
      icon: <HeartOutlined />,
      label: "Wishlist",
      onClick: () => router.push("/buyer/wishlist"),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Log out",
      danger: true,
      onClick: () => router.push("/auth/login"),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fb" }}>
      <Header
        user={{ name: "Buyer" }}
        profileMenuItems={profileMenuItems}
        onSearch={(term) => console.log("search:", term)}
        onChangeLocation={(loc) => console.log("location:", loc)}
      />
      <Content style={{ padding: 24, maxWidth: 1280, width: "100%", margin: "0 auto" }}>
        <Title level={3}>Welcome to MarketHub</Title>
        <Text type="secondary">Dashboard sections will go here.</Text>
      </Content>
    </Layout>
  );
}
