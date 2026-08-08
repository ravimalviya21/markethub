import { Product as ApiProduct, ProductDetail, ProductFeedParams, ProductListParams } from "@/services/product.service";
import { Product as ProductCardModel } from "@/components/ui/ProductCard";
import {
    CURATED_FEED_LIMIT,
    DEFAULT_PRODUCT_SORT,
    PRODUCT_PAGE_SIZE,
    PRODUCT_SORT_MAP,
    ProductSortConfig,
    ProductSortValue,
} from "@/contants/product";
import { firstValue, toPositiveInt, toPrice } from "@/utils/customMethods";

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

export const getProductGalleryUrls = (product: ProductDetail): string[] => {
    const urls = product.images.map((image) => image.url);
    if (urls.length === 0 && product.primaryImageUrl) return [product.primaryImageUrl];
    return urls;
};

export interface ProductFilters {
    search?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
}

export interface ProductListingQuery {
    sort: ProductSortValue;
    sortConfig: ProductSortConfig;
    page: number;
    filters: ProductFilters;
    isCurated: boolean;
}

export const parseProductListingQuery = (
    query: Record<string, string | string[] | undefined>
): ProductListingQuery => {
    const rawSort = firstValue(query.sort);
    const sort = (
        rawSort && PRODUCT_SORT_MAP[rawSort] ? rawSort : DEFAULT_PRODUCT_SORT
    ) as ProductSortValue;
    const sortConfig = PRODUCT_SORT_MAP[sort];

    return {
        sort,
        sortConfig,
        page: toPositiveInt(firstValue(query.page)) ?? 1,
        filters: {
            search: (firstValue(query.q) ?? "").trim(),
            categoryId: toPositiveInt(firstValue(query.categoryId)),
            minPrice: toPrice(firstValue(query.minPrice)),
            maxPrice: toPrice(firstValue(query.maxPrice)),
        },
        isCurated: Boolean(sortConfig.feedType),
    };
};

export const filterProducts = (
    products: ApiProduct[],
    { search, minPrice, maxPrice }: ProductFilters
): ApiProduct[] => {
    const needle = (search ?? "").trim().toLowerCase();

    return products.filter((product) => {
        const haystack = `${product.name} ${product.description ?? ""}`.toLowerCase();
        if (needle && !haystack.includes(needle)) return false;
        if (minPrice != null && product.price < minPrice) return false;
        if (maxPrice != null && product.price > maxPrice) return false;
        return true;
    });
};

export const buildFeedParams = (
    sortConfig: ProductSortConfig,
    categoryId?: number,
    limit = CURATED_FEED_LIMIT
): ProductFeedParams => ({
    type: sortConfig.feedType ?? "popular",
    limit,
    ...(categoryId ? { categoryId } : {}),
});

export const buildListParams = (
    sortConfig: ProductSortConfig,
    page: number,
    { search, categoryId, minPrice, maxPrice }: ProductFilters,
    limit = PRODUCT_PAGE_SIZE
): ProductListParams => ({
    page,
    limit,
    status: "approved",
    sortBy: sortConfig.sortBy ?? "createdAt",
    sortOrder: sortConfig.sortOrder ?? "desc",
    ...(search ? { q: search } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(minPrice != null ? { minPrice } : {}),
    ...(maxPrice != null ? { maxPrice } : {}),
});

export const getListingCopy = (
    sortConfig: ProductSortConfig,
    search: string,
    categoryName?: string
) => {
    if (search) {
        return { heading: `Results for “${search}”`, subtitle: "Products matching your search" };
    }
    if (categoryName) {
        return { heading: categoryName, subtitle: `Everything listed under ${categoryName}` };
    }
    return { heading: sortConfig.heading, subtitle: sortConfig.subtitle };
};
