import Link from "next/link";
import { useRouter } from "next/router";
import { MailOutlined } from "@ant-design/icons";
import { Typography } from "antd";

import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui";

const { Text, Paragraph } = Typography;

export default function VerifyEmailSentPage() {
  const router = useRouter();
  const { email } = router.query;

  return (
    <AuthLayout
      title="Check your email"
      subtitle="One last step to activate your account"
      footer={
        <Text type="secondary">
          Already verified?{" "}
          <Link href="/auth/login" style={{ color: "#1677ff" }}>
            Log in
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
            background: "#e6f4ff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <MailOutlined style={{ fontSize: 32, color: "#1677ff" }} />
        </div>

        <Paragraph style={{ marginBottom: 8 }}>
          A verification email has been sent
          {email ? (
            <>
              {" "}to <Text strong>{email}</Text>
            </>
          ) : (
            " to your inbox"
          )}
          .
        </Paragraph>

        <Paragraph type="secondary" style={{ marginBottom: 24 }}>
          Click the link in the email to verify your account. If you don&apos;t see it,
          check your spam folder.
        </Paragraph>

        <Link href="/auth/login">
          <Button block>Go to login</Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
