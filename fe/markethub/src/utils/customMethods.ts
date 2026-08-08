import { AxiosError } from "axios";

interface ApiErrorBody {
  message?: string;
  error?: string;
  issues?: { path: string; message: string }[];
}

export const getApiErrorMessage = (error: unknown, fallback = "Something went wrong") => {
  const err = error as AxiosError<ApiErrorBody>;
  const data = err?.response?.data;
  if (data?.issues?.length) {
    return data.issues.map((issue) => issue.message).join(", ");
  }
  if (typeof data === "string") return fallback;
  return data?.message || err?.message || fallback;
};

export const formatPrice = (value: number | null | undefined, currency: string) => {
  if (value == null) return "";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value}`;
  }
};

export const computeDiscount = (price: number, originalPrice: number | null | undefined) => {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

export const formatCount = (value: number | null | undefined) =>
  Number(value ?? 0).toLocaleString("en-IN");

export const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export const toPositiveInt = (value: string | undefined) => {
  const parsed = Number(value);
  return value && Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
};

export const toPrice = (value: string | undefined) => {
  const parsed = Number(value);
  return value && Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

export const paginate = <T>(items: T[], page: number, pageSize: number) =>
  items.slice((page - 1) * pageSize, page * pageSize);
