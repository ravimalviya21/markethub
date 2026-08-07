import * as yup from "yup";

export const PRODUCT_NAME_MAX = 255;
export const PRODUCT_DESCRIPTION_MAX = 5000;
export const PRODUCT_IMAGE_URL_MAX = 500;
export const PRODUCT_PRICE_MAX = 99999999.99;

export const PRODUCT_FORM_STATUSES = ["draft", "pending", "approved"] as const;
export type ProductFormStatus = (typeof PRODUCT_FORM_STATUSES)[number];

export const productFormSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Product name is required")
    .max(PRODUCT_NAME_MAX, `Name must be at most ${PRODUCT_NAME_MAX} characters`),
  sellerId: yup
    .number()
    .nullable()
    .integer("Select a valid seller")
    .positive("Select a valid seller")
    .default(null)
    .when("$mode", {
      is: "create",
      then: (schema) => schema.required("Select the seller this product belongs to"),
    }),
  status: yup
    .mixed<ProductFormStatus>()
    .oneOf([...PRODUCT_FORM_STATUSES])
    .required()
    .default("pending"),
  categoryId: yup
    .number()
    .nullable()
    .integer("Select a valid category")
    .positive("Select a valid category")
    .default(null),
  description: yup
    .string()
    .trim()
    .transform((value) => (value === "" ? undefined : value))
    .max(PRODUCT_DESCRIPTION_MAX, `Description must be at most ${PRODUCT_DESCRIPTION_MAX} characters`)
    .optional(),
  price: yup
    .number()
    .typeError("Price is required")
    .required("Price is required")
    .min(0, "Price cannot be negative")
    .max(PRODUCT_PRICE_MAX, "Price is too large"),
  mrp: yup
    .number()
    .nullable()
    .transform((value, original) => (original === "" || original == null ? null : value))
    .min(0, "MRP cannot be negative")
    .max(PRODUCT_PRICE_MAX, "MRP is too large")
    .test(
      "mrp-not-below-price",
      "MRP cannot be lower than the selling price",
      (value, context) => value == null || value >= context.parent.price
    )
    .default(null),
  stock: yup
    .number()
    .typeError("Stock is required")
    .required("Stock is required")
    .integer("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .default(0),
  imageUrl: yup
    .string()
    .trim()
    .transform((value) => (value === "" ? undefined : value))
    .url("Enter a valid URL (https://...)")
    .max(PRODUCT_IMAGE_URL_MAX, `Image URL must be at most ${PRODUCT_IMAGE_URL_MAX} characters`)
    .optional(),
});

export interface ProductFormValues {
  name: string;
  sellerId: number | null;
  status: ProductFormStatus;
  categoryId: number | null;
  description: string | undefined;
  price: number;
  mrp: number | null;
  stock: number;
  imageUrl: string | undefined;
}

export type ProductFormOutput = yup.InferType<typeof productFormSchema>;
