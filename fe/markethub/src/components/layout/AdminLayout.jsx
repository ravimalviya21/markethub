import { useRouter } from "next/router";
import { Layout } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  ShoppingOutlined,
  AuditOutlined,
  ExclamationCircleOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

import Header from "@/components/layout/Header";
import { ADMIN_PROFILE } from "@/utils/dummy";

const { Content } = Layout;

const AdminLayout = ({ children, maxWidth = 1280 }) => {
  const router = useRouter();

  const profileMenuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => router.push("/admin/dashboard"),
    },
    {
      key: "users",
      icon: <TeamOutlined />,
      label: "Users",
      onClick: () => router.push("/admin/users"),
    },
    {
      key: "orders",
      icon: <ShoppingOutlined />,
      label: "Orders",
      onClick: () => router.push("/admin/orders"),
    },
    {
      key: "approvals",
      icon: <AuditOutlined />,
      label: "Approvals",
      onClick: () => router.push("/admin/approvals"),
    },
    {
      key: "disputes",
      icon: <ExclamationCircleOutlined />,
      label: "Disputes",
      onClick: () => router.push("/admin/disputes"),
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
        showSearch={false}
        showLocation={false}
        showCart={false}
        logoHref="/admin/dashboard"
        user={{ name: ADMIN_PROFILE.name, avatarUrl: ADMIN_PROFILE.avatar }}
        profileMenuItems={profileMenuItems}
      />
      <Content>
        <div style={{ padding: 24, maxWidth, width: "100%", margin: "0 auto" }}>
          {children}
        </div>
      </Content>
    </Layout>
  );
};

export default AdminLayout;
