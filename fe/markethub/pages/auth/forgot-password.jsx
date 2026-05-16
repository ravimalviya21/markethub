import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { App, Typography } from "antd";

import AuthLayout from "@/components/layout/AuthLayout";
import { Input, Button } from "@/components/ui";
import { forgotPasswordSchema } from "@/validations/auth.validation";
import { useForgotPassword } from "../../src/services/auth.service";

const { Text } = Typography;

export default function ForgotPasswordPage() {
  const { message } = App.useApp();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });
  const forgetPassMutation = useForgotPassword();

  const onSubmit = async (values) => {
    try {
      const response = await forgetPassMutation.mutateAsync(values);
      if (response?.success) {
        message.success("Reset link has been sent over the mail")
      } else {
        message.error(response?.message || "Something went wrong")
      }
    } catch (error) {
      message.error(error?.response?.data?.message || error?.message || "Login failed");
    }
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link"
      footer={
        <Text type="secondary">
          Remembered it?{" "}
          <Link href="/auth/login" style={{ color: "#1677ff" }}>
            Back to login
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

        <Button htmlType="submit" block loading={isSubmitting}>
          Send reset link
        </Button>
      </form>
    </AuthLayout>
  );
}
