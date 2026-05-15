import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { App, Typography } from "antd";

import AuthLayout from "@/components/layout/AuthLayout";
import { Input, Button, GoogleAuthButton } from "@/components/ui";
import { signupSchema } from "@/validations/auth.validation";
import { useSignup } from "../../src/services/auth.service";

const { Text } = Typography;

export default function SignupPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
    mode: "onTouched",
  });

  const signUpMutation = useSignup();

  const onSubmit = async (values) => {
    try {
      const response = await signUpMutation.mutateAsync(values);
      if (response?.success) {
        message.success("Account created. Please verify your email.");
        router.push({
          pathname: "/auth/verify-email-sent",
          query: { email: values.email },
        });
      } else {
        message.error(response?.message || "Something went wrong");
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || error?.message || "Signup failed";
      message.error(errMsg);
    }
  };

  const handleGoogleSignup = () => {
    const apiBase =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002/api/v1";
    window.location.href = `${apiBase}/auth/google`;
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join MarketHub as a buyer"
      footer={
        <Text type="secondary">
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: "#1677ff" }}>
            Log in
          </Link>
        </Text>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          name="name"
          control={control}
          label="Name"
          placeholder="John Doe"
          required
        />
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
          placeholder="At least 8 characters"
          required
        />

        <Button htmlType="submit" block loading={isSubmitting}>
          Sign up
        </Button>
      </form>

      <GoogleAuthButton label="Sign up with Google" onClick={handleGoogleSignup} />

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Text type="secondary">Want to sell on MarketHub? </Text>
        <Link href="/auth/signup-seller" style={{ color: "#1677ff" }}>
          Sign up as seller
        </Link>
      </div>
    </AuthLayout>
  );
}
