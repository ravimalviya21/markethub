import { ComponentProps, CSSProperties, ReactNode } from "react";
import { Layout } from "antd";

import CategoryNav from "@/components/ui/CategoryNav";
import Header from "@/components/layout/Header";
import { HeaderRole } from "@/components/layout/Header/config";
import { HeaderUser } from "@/components/layout/Header/ProfileMenu";
import { useProfileMenuItems } from "@/components/layout/Header/useProfileMenuItems";
import { useSession } from "@/config/session";
import { getDashboardForRole } from "@/utils/auth";

type HeaderPassthrough = Omit<ComponentProps<typeof Header>, "role" | "profileMenuItems">;

interface AppLayoutProps extends HeaderPassthrough {
  children: ReactNode;
  role?: HeaderRole;
  maxWidth?: number;
  contentStyle?: CSSProperties;
  showCategoryNav?: boolean;
  onCategorySelect?: ComponentProps<typeof CategoryNav>["onCategorySelect"];
}

const CATEGORY_NAV_ROLES: HeaderRole[] = ["guest", "buyer"];

const AppLayout = ({
  children,
  role,
  maxWidth = 1280,
  contentStyle,
  showCategoryNav,
  onCategorySelect,
  user,
  ...headerProps
}: AppLayoutProps) => {
  const session = useSession();
  const resolvedRole = role ?? session.role;

  const sessionUser: HeaderUser | undefined = session.user
    ? { name: session.user.name, email: session.user.email }
    : undefined;

  const profileMenuItems = useProfileMenuItems(resolvedRole);
  const categoryNavVisible = showCategoryNav ?? CATEGORY_NAV_ROLES.includes(resolvedRole);

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fb" }}>
      <Header
        role={resolvedRole}
        user={user ?? sessionUser}
        logoHref={resolvedRole === "guest" ? "/" : getDashboardForRole(resolvedRole)}
        profileMenuItems={profileMenuItems}
        {...headerProps}
      />

      {categoryNavVisible && (
        <CategoryNav maxWidth={maxWidth} onCategorySelect={onCategorySelect} />
      )}

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
