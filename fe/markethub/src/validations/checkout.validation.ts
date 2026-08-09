import * as yup from "yup";

import { DEFAULT_COUNTRY } from "@/contants/checkout";

export const shippingAddressSchema = yup.object({
  fullName: yup
    .string()
    .trim()
    .required("Full name is required")
    .max(255, "Full name must be at most 255 characters"),
  phone: yup
    .string()
    .trim()
    .required("Phone number is required")
    .matches(/^[0-9+\-\s]{6,20}$/, "Enter a valid phone number"),
  line1: yup
    .string()
    .trim()
    .required("Address is required")
    .max(255, "Address must be at most 255 characters"),
  line2: yup.string().trim().max(255, "Address must be at most 255 characters").default(""),
  city: yup
    .string()
    .trim()
    .required("City is required")
    .max(100, "City must be at most 100 characters"),
  state: yup
    .string()
    .trim()
    .required("State is required")
    .max(100, "State must be at most 100 characters"),
  postalCode: yup
    .string()
    .trim()
    .required("PIN code is required")
    .matches(/^[0-9]{6}$/, "Enter a valid 6 digit PIN code"),
  country: yup
    .string()
    .trim()
    .required("Country is required")
    .max(100, "Country must be at most 100 characters")
    .default(DEFAULT_COUNTRY),
});

export type ShippingAddressFormValues = yup.InferType<typeof shippingAddressSchema>;

export const EMPTY_SHIPPING_ADDRESS: ShippingAddressFormValues = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: DEFAULT_COUNTRY,
};
