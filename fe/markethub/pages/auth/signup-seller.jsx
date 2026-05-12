import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { App, Typography } from "antd";

import AuthLayout from "@/components/layout/AuthLayout";
import { Input, Button, GoogleAuthButton } from "@/components/ui";
import { sellerSignupSchema } from "@/validations/auth.validation";

const { Text } = Typography;

export default function SignupSellerPage() {
  const { message } = App.useApp();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(sellerSignupSchema),
    defaultValues: { name: "", email: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
    console.log("signup-seller", values);
    message.success("Seller account created (stub)");
  };

  const handleGoogleSignup = () => {
    message.info("Google seller signup (stub)");
  };

  return (
    <AuthLayout
      title="Become a seller"
      subtitle="Create your MarketHub seller account"
      footer={
        <Text type="secondary">
          Already a seller?{" "}
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
          label="Full name or business name"
          placeholder="Acme Co."
          required
        />
        <Input
          name="email"
          control={control}
          label="Email"
          type="email"
          placeholder="you@business.com"
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
          Create seller account
        </Button>
      </form>

      <GoogleAuthButton label="Sign up with Google" onClick={handleGoogleSignup} />

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Text type="secondary">Shopping instead? </Text>
        <Link href="/auth/signup" style={{ color: "#1677ff" }}>
          Sign up as buyer
        </Link>
      </div>
    </AuthLayout>
  );
}
