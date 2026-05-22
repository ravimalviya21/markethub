import { useRouter } from "next/router";
import { Layout, Typography } from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  HeartOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

import Header from "@/components/layout/Header";
import { BannerCarousel } from "@/components/ui";

const DASHBOARD_BANNERS = [
  {
    id: 1,
    image: "https://picsum.photos/seed/markethub-1/1600/500",
    title: "Mega Electronics Sale",
    subtitle: "Up to 70% off top brands",
    cta: "Shop now",
    href: "/buyer/category/electronics",
  },
  {
    id: 2,
    image: "https://picsum.photos/seed/markethub-2/1600/500",
    title: "Fashion Week",
    subtitle: "New arrivals from your favourite labels",
    cta: "Explore",
    href: "/buyer/category/fashion",
  },
  {
    id: 3,
    image: "https://picsum.photos/seed/markethub-3/1600/500",
    title: "Home Essentials",
    subtitle: "Upgrade your space, starting at ₹299",
    cta: "Browse",
    href: "/buyer/category/home",
  },
  {
    id: 4,
    image: "https://picsum.photos/seed/markethub-4/1600/500",
    title: "Grocery Deals",
    subtitle: "Free delivery on orders above ₹499",
    cta: "Order now",
    href: "/buyer/category/grocery",
  },
  {
    id: 5,
    image: "https://picsum.photos/seed/markethub-5/1600/500",
    title: "Become a Seller",
    subtitle: "Reach millions of buyers across India",
    cta: "Get started",
    href: "/auth/signup-seller",
  },
];

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
      <Content>
        <div style={{ padding: "24px 24px 0" }}>
          <BannerCarousel banners={DASHBOARD_BANNERS} height={320} controls="both" />
        </div>
        <div style={{ padding: 24, maxWidth: 1280, width: "100%", margin: "0 auto" }}>
          <Title level={3} style={{ marginTop: 8 }}>Welcome to MarketHub</Title>
          <Text type="secondary">Dashboard sections will go here.</Text>
        </div>
      </Content>
    </Layout>
  );
}
