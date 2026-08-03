import { ComponentProps, CSSProperties, ReactNode } from "react";
import { Layout } from "antd";

import Header from "@/components/layout/Header";
import { HeaderRole } from "@/components/layout/Header/config";
import { HeaderUser } from "@/components/layout/Header/ProfileMenu";
import { useProfileMenuItems } from "@/components/layout/Header/useProfileMenuItems";
import { getDashboardForRole } from "@/utils/auth";
import { USER_PROFILE } from "@/utils/dummy";

type HeaderPassthrough = Omit<ComponentProps<typeof Header>, "role" | "profileMenuItems">;

const FALLBACK_USERS: Partial<Record<HeaderRole, HeaderUser>> = {
  buyer: {
    name: `${USER_PROFILE.firstName} ${USER_PROFILE.lastName}`,
    email: USER_PROFILE.email,
    avatarUrl: USER_PROFILE.avatar,
  },
};

interface AppLayoutProps extends HeaderPassthrough {
  children: ReactNode;
  role?: HeaderRole;
  maxWidth?: number;
  contentStyle?: CSSProperties;
}

const AppLayout = ({
  children,
  role = "guest",
  maxWidth = 1280,
  contentStyle,
  user,
  ...headerProps
}: AppLayoutProps) => {
  const profileMenuItems = useProfileMenuItems(role);

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fb" }}>
      <Header
        role={role}
        user={user ?? FALLBACK_USERS[role]}
        logoHref={role === "guest" ? "/" : getDashboardForRole(role)}
        profileMenuItems={profileMenuItems}
        {...headerProps}
      />
      <Layout.Content>
        <div
          style={{
            padding: 24,
            maxWidth,
            width: "100%",
            margin: "0 auto",
            ...contentStyle,
          }}
        >
          {children}
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default AppLayout;
