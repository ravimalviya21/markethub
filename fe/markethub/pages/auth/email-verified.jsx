import Link from "next/link";
import { CheckCircleFilled } from "@ant-design/icons";
import { Typography } from "antd";

import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui";

const { Text, Paragraph } = Typography;

export default function EmailVerifiedPage() {
  return (
    <AuthLayout
      title="Email verified"
      subtitle="Your account is now active"
      footer={
        <Text type="secondary">
          Need help?{" "}
          <Link href="/" style={{ color: "#1677ff" }}>
            Go to home
          </Link>
        </Text>
      }
    >
      <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#f6ffed",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <CheckCircleFilled style={{ fontSize: 40, color: "#52c41a" }} />
        </div>

        <Paragraph style={{ marginBottom: 8 }}>
          Your email account has been <Text strong>verified</Text>.
        </Paragraph>

        <Paragraph type="secondary" style={{ marginBottom: 24 }}>
          You can now log in and start using MarketHub.
        </Paragraph>

        <Link href="/auth/login">
          <Button block>Continue to login</Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
