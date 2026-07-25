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
