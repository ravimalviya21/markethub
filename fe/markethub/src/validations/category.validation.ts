import * as yup from "yup";

export const CATEGORY_NAME_MAX = 50;
export const CATEGORY_IMAGE_URL_MAX = 50;

export const categoryFormSchema = yup.object({
  displayName: yup
    .string()
    .trim()
    .required("Category name is required")
    .max(CATEGORY_NAME_MAX, `Name must be at most ${CATEGORY_NAME_MAX} characters`),
  parentId: yup
    .number()
    .nullable()
    .integer("Parent must be a valid category")
    .positive("Parent must be a valid category")
    .default(null),
  imageUrl: yup
    .string()
    .trim()
    .transform((value) => (value === "" ? undefined : value))
    .url("Enter a valid URL (https://...)")
    .max(CATEGORY_IMAGE_URL_MAX, `Image URL must be at most ${CATEGORY_IMAGE_URL_MAX} characters`)
    .optional(),
  isActive: yup.boolean().default(false),
});

export interface CategoryFormValues {
  displayName: string;
  parentId: number | null;
  imageUrl: string | undefined;
  isActive: boolean;
}

export type CategoryFormOutput = yup.InferType<typeof categoryFormSchema>;
