import * as yup from "yup";

const emailRule = yup
  .string()
  .trim()
  .required("Email is required")
  .email("Enter a valid email");

const passwordRule = yup
  .string()
  .required("Password is required")
  .min(8, "Password must be at least 8 characters");

export const loginSchema = yup.object({
  email: emailRule,
  password: yup.string().required("Password is required"),
});

export const signupSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: emailRule,
  password: passwordRule,
});

export const sellerSignupSchema = signupSchema;

export const forgotPasswordSchema = yup.object({
  email: emailRule,
});
