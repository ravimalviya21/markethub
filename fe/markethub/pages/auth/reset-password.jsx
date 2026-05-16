import { useRouter } from "next/router";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { App, Typography } from "antd";

import AuthLayout from "@/components/layout/AuthLayout";
import { Input, Button } from "@/components/ui";
import { resetPasswordSchema } from "@/validations/auth.validation";
import { useResetPassword } from "../../src/services/auth.service";

const { Text } = Typography;

export default function ResetPasswordPage() {
    const router = useRouter();
    const { message } = App.useApp();
    const { token, id } = router.query;

    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm({
        resolver: yupResolver(resetPasswordSchema),
        defaultValues: { password: "", confirmPassword: "" },
        mode: "onTouched",
    });

    const resetPassMutation = useResetPassword();

    const onSubmit = async (values) => {
        try {
            const response = await resetPassMutation.mutateAsync({
                id,
                token,
                password: values.password,
            });
            if (response?.success) {
                message.success(
                    response?.data?.message || "Password updated successfully"
                );
                router.push("/auth/login");
            } else {
                message.error(response?.message || "Something went wrong");
            }
        } catch (error) {
            message.error(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to reset password"
            );
        }
    };

    return (
        <AuthLayout
            title="Reset your password"
            subtitle="Enter a new password for your account"
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
                    name="password"
                    control={control}
                    label="New password"
                    type="password"
                    placeholder="Enter new password"
                    required
                />

                <Input
                    name="confirmPassword"
                    control={control}
                    label="Confirm new password"
                    type="password"
                    placeholder="Re-enter new password"
                    required
                />

                <Button htmlType="submit" block loading={isSubmitting}>
                    Reset password
                </Button>
            </form>
        </AuthLayout>
    );
}
