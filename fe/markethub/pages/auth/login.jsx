import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { App, Typography } from "antd";

import AuthLayout from "@/components/layout/AuthLayout";
import { Input, Button, GoogleAuthButton } from "@/components/ui";
import { loginSchema } from "@/validations/auth.validation";

const { Text } = Typography;

export default function LoginPage() {
  const { message } = App.useApp();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
    console.log("login", values);
    message.success("Logged in (stub)");
  };

  const handleGoogleLogin = () => {
    // OAuth must be a top-level navigation, NOT an XHR/fetch call.
    // Otherwise the browser tries to follow Google's redirect via XHR and blocks it with CORS.
    // Note: Next.js only exposes env vars prefixed with NEXT_PUBLIC_ to the browser.
    const apiBase =
      process.env.BACKEND_URL || "http://localhost:3002/api/v1";
    window.location.href = `${apiBase}/auth/google`;
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your MarketHub account"
      footer={
        <Text type="secondary">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" style={{ color: "#1677ff" }}>
            Sign up
          </Link>
        </Text>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          name="email"
          control={control}
          label="Email"
          type="email"
          placeholder="you@example.com"
          required
        />
        <Input
          name="password"
          control={control}
          label="Password"
          type="password"
          placeholder="Enter your password"
          required
        />

        <div style={{ textAlign: "right", marginBottom: 16 }}>
          <Link href="/auth/forgot-password" style={{ color: "#1677ff" }}>
            Forgot password?
          </Link>
        </div>

        <Button htmlType="submit" block loading={isSubmitting}>
          Log in
        </Button>
      </form>

      <GoogleAuthButton label="Continue with Google" onClick={handleGoogleLogin} />

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Text type="secondary">Are you a seller? </Text>
        <Link href="/auth/signup-seller" style={{ color: "#1677ff" }}>
          Sign up as seller
        </Link>
      </div>
    </AuthLayout>
  );
}
