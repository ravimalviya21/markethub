import Link from "next/link";
import { Card, Divider, Typography } from "antd";

const { Title, Text } = Typography;

/**
 * Shared layout for auth pages (login, signup, etc.).
 */
const AuthLayout = ({ title, subtitle, children, footer }) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          borderRadius: 12,
        }}
        bodyStyle={{ padding: 32 }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Link href="/">
            <Title level={3} style={{ margin: 0 }}>
              MarketHub
            </Title>
          </Link>
          {title && (
            <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
              {title}
            </Title>
          )}
          {subtitle && <Text type="secondary">{subtitle}</Text>}
        </div>

        {children}

        {footer && (
          <>
            <Divider style={{ margin: "16px 0" }} />
            <div style={{ textAlign: "center" }}>{footer}</div>
          </>
        )}
      </Card>
    </div>
  );
};

export default AuthLayout;
