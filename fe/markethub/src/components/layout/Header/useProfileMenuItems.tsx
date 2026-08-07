import { ReactNode } from "react";
import { useRouter } from "next/router";
import { MenuProps } from "antd";
import {
  AppstoreOutlined,
  AuditOutlined,
  DashboardOutlined,
  ExclamationCircleOutlined,
  HeartOutlined,
  LoginOutlined,
  LogoutOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { useLogout } from "@/services/auth.service";
import { HeaderRole, DEFAULT_HEADER_ROLE } from "./config";

export type ProfileMenuItem = NonNullable<MenuProps["items"]>[number] & {
  key?: string;
  onClick?: (event?: React.MouseEvent) => void;
};

interface MenuLink {
  key: string;
  label: string;
  icon: ReactNode;
  href: string;
}

const ROLE_LINKS: Record<HeaderRole, MenuLink[]> = {
  guest: [
    { key: "login", label: "Log in", icon: <LoginOutlined />, href: "/auth/login" },
    { key: "signup", label: "Sign up", icon: <UserAddOutlined />, href: "/auth/signup" },
    { key: "sell", label: "Sell on MarketHub", icon: <ShopOutlined />, href: "/auth/signup-seller" },
  ],
  buyer: [
    { key: "dashboard", label: "Dashboard", icon: <DashboardOutlined />, href: "/buyer/dashboard" },
    { key: "orders", label: "My orders", icon: <ShoppingOutlined />, href: "/account/orders" },
    { key: "wishlist", label: "Wishlist", icon: <HeartOutlined />, href: "/account/wishlist" },
    { key: "cart", label: "Cart", icon: <ShoppingCartOutlined />, href: "/account/cart" },
    { key: "profile", label: "Profile", icon: <UserOutlined />, href: "/account/profile" },
  ],
  seller: [
    { key: "dashboard", label: "Dashboard", icon: <DashboardOutlined />, href: "/seller/dashboard" },
    { key: "products", label: "Products", icon: <AppstoreOutlined />, href: "/seller/products" },
    { key: "orders", label: "Orders", icon: <ShoppingOutlined />, href: "/seller/orders" },
    { key: "profile", label: "Profile", icon: <UserOutlined />, href: "/account/profile" },
  ],
  admin: [
    { key: "dashboard", label: "Dashboard", icon: <DashboardOutlined />, href: "/admin/dashboard" },
    { key: "users", label: "Users", icon: <TeamOutlined />, href: "/admin/user-management" },
    { key: "orders", label: "Orders", icon: <ShoppingOutlined />, href: "/admin/order-management" },
    { key: "approvals", label: "Approvals", icon: <AuditOutlined />, href: "/admin/approvals" },
    { key: "disputes", label: "Disputes", icon: <ExclamationCircleOutlined />, href: "/admin/disputes" },
  ],
};

interface ProfileMenuOptions {
  redirectTo?: string;
}

export const useProfileMenuItems = (
  role: HeaderRole = DEFAULT_HEADER_ROLE,
  { redirectTo = "/buyer/dashboard" }: ProfileMenuOptions = {}
): ProfileMenuItem[] => {
  const router = useRouter();
  const logout = useLogout({
    onSuccess: () => router.replace(redirectTo),
  });

  const links = ROLE_LINKS[role] ?? ROLE_LINKS[DEFAULT_HEADER_ROLE];

  const items: ProfileMenuItem[] = links.map(({ key, label, icon, href }) => ({
    key,
    label,
    icon,
    onClick: () => router.push(href),
  }));

  if (role === "guest") return items;

  return [
    ...items,
    { type: "divider" as const },
    {
      key: "logout",
      label: logout.isPending ? "Logging out..." : "Log out",
      icon: <LogoutOutlined />,
      danger: true,
      disabled: logout.isPending,
      onClick: () => logout.mutate(),
    },
  ];
};

export default useProfileMenuItems;
