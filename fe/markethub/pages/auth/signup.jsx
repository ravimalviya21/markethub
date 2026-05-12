import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { App, Typography } from "antd";

import AuthLayout from "@/components/layout/AuthLayout";
import { Input, Button, GoogleAuthButton } from "@/components/ui";
import { signupSchema } from "@/validations/auth.validation";

const { Text } = Typography;

export default function SignupPage() {
  const { message } = App.useApp();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
    console.log("signup", values);
    message.success("Account created (stub)");
  };

  const handleGoogleSignup = () => {
    message.info("Google signup (stub)");
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
