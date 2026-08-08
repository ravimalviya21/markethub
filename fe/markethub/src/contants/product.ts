import type { ComponentType } from "react";
import {
    SafetyCertificateOutlined,
    SyncOutlined,
    TruckOutlined,
} from "@ant-design/icons";

import type { ProductFeedType, ProductListParams } from "@/services/product.service";

export const PRODUCT_PAGE_SIZE = 12;
export const CURATED_FEED_LIMIT = 50;
export const PRODUCT_LIST_REVALIDATE_SECONDS = 300;
export const LOW_STOCK_THRESHOLD = 10;
export const RELATED_PRODUCTS_LIMIT = 8;
export const RELATED_PRODUCTS_VISIBLE = 4;

export const PRODUCT_GRID_COLUMNS = { xs: 24, sm: 12, md: 8, lg: 8, xl: 6 };

export const DEFAULT_LISTING_HEADING = "All products";
export const DEFAULT_LISTING_SUBTITLE = "Every listing available on MarketHub";

export type ProductSortValue =
    | "popular"
    | "deals"
    | "trending"
    | "newest"
    | "price-asc"
    | "price-desc"
    | "rating";

export interface ProductSortConfig {
    value: ProductSortValue;
    label: string;
    heading: string;
    subtitle: string;
    feedType?: ProductFeedType;
    sortBy?: ProductListParams["sortBy"];
    sortOrder?: ProductListParams["sortOrder"];
}

export const PRODUCT_SORTS: ProductSortConfig[] = [
    {
        value: "popular",
        label: "Most popular",
        heading: "Recommended for you",
        subtitle: "Top rated picks across the marketplace",
        feedType: "popular",
    },
    {
        value: "deals",
        label: "Biggest discount",
        heading: "Best deals for today",
        subtitle: "Biggest savings against MRP right now",
        feedType: "deals",
    },
    {
        value: "trending",
        label: "Trending now",
        heading: "Trending this week",
        subtitle: "Most ordered by shoppers over the last 7 days",
        feedType: "trending",
    },
    {
        value: "newest",
        label: "Newest first",
        heading: DEFAULT_LISTING_HEADING,
        subtitle: DEFAULT_LISTING_SUBTITLE,
        sortBy: "createdAt",
        sortOrder: "desc",
    },
    {
        value: "price-asc",
        label: "Price: low to high",
        heading: DEFAULT_LISTING_HEADING,
        subtitle: DEFAULT_LISTING_SUBTITLE,
        sortBy: "price",
        sortOrder: "asc",
    },
    {
        value: "price-desc",
        label: "Price: high to low",
        heading: DEFAULT_LISTING_HEADING,
        subtitle: DEFAULT_LISTING_SUBTITLE,
        sortBy: "price",
        sortOrder: "desc",
    },
    {
        value: "rating",
        label: "Top rated",
        heading: DEFAULT_LISTING_HEADING,
        subtitle: DEFAULT_LISTING_SUBTITLE,
        sortBy: "averageRating",
        sortOrder: "desc",
    },
];

export const PRODUCT_SORT_MAP = PRODUCT_SORTS.reduce<Record<string, ProductSortConfig>>(
    (acc, config) => {
        acc[config.value] = config;
        return acc;
    },
    {}
);

export const DEFAULT_PRODUCT_SORT: ProductSortValue = "newest";

export const PRODUCT_SORT_OPTIONS = PRODUCT_SORTS.map(({ value, label }) => ({ value, label }));

export interface DeliveryHighlight {
    icon: ComponentType;
    title: string;
    text: string;
}

export const DELIVERY_HIGHLIGHTS: DeliveryHighlight[] = [
    { icon: TruckOutlined, title: "Free delivery", text: "On orders above ₹499" },
    { icon: SyncOutlined, title: "7 day returns", text: "Easy replacement policy" },
    { icon: SafetyCertificateOutlined, title: "Secure payments", text: "Protected checkout" },
];
