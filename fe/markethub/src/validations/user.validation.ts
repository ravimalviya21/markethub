import * as yup from "yup";

export const USER_ROLES = ["buyer", "seller", "admin"] as const;
export type UserFormRole = (typeof USER_ROLES)[number];

export const PASSWORD_MIN = 8;

export const createUserSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be at most 255 characters"),
  email: yup
    .string()
    .trim()
    .required("Email is required")
    .email("Enter a valid email")
    .max(255, "Email must be at most 255 characters"),
  password: yup
    .string()
    .required("Password is required")
    .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
    .max(128, "Password must be at most 128 characters"),
  role: yup.mixed<UserFormRole>().oneOf([...USER_ROLES]).required().default("buyer"),
});

export interface CreateUserFormValues {
  name: string;
  email: string;
  password: string;
  role: UserFormRole;
}

export type CreateUserFormOutput = yup.InferType<typeof createUserSchema>;
