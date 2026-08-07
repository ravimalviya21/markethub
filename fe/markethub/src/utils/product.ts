import { Product as ApiProduct } from "@/services/product.service";
import { Product as ProductCardModel } from "@/components/ui/ProductCard";

export const toProductCardModel = (product: ApiProduct): ProductCardModel => ({
    id: product.id,
    title: product.name,
    description: product.description ?? undefined,
    image: product.primaryImageUrl ?? undefined,
    alt: product.name,
    price: product.price,
    originalPrice: product.mrp != null && product.mrp > product.price ? product.mrp : undefined,
    currency: "INR",
    rating: product.reviewsCount > 0 ? product.averageRating : null,
    reviewCount: product.reviewsCount,
    inStock: product.stock > 0,
});

export const computeDiscountPercent = (product: ApiProduct) => {
    if (product.mrp == null || product.mrp <= product.price) return null;
    return Math.round(((product.mrp - product.price) / product.mrp) * 100);
};
