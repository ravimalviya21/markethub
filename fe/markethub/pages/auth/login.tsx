import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { yupResolver } from "@hookform/resolvers/yup";
import { App, Typography } from "antd";
import { AxiosError } from "axios";

import AuthLayout from "@/components/layout/AuthLayout";
import { Input, Button, GoogleAuthButton } from "@/components/ui";
import { loginSchema } from "@/validations/auth.validation";
import { useLogin } from "../../src/services/auth.service";

const { Text } = Typography;

interface FormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { message } = App.useApp();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });
  const router = useRouter();
  const loginMutation = useLogin();

  const onSubmit = async (values: FormValues) => {

    try {
      const response = await loginMutation.mutateAsync(values);
      if (response?.success) {
        router.push({
          pathname: "/",
        });
      } else {
        message.error(response?.message || "Something went wrong");
      }
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const errMsg =
        err?.response?.data?.message || err?.message || "Login failed";
      message.error(errMsg);
    }
  };

  const handleGoogleLogin = () => {
    const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002/api/v1";
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
