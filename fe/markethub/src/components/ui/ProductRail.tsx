import { ReactNode } from "react";
import { Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { AxiosError } from "axios";

import ProductGrid from "./ProductGrid";
import { Product } from "@/services/product.service";

const { Title, Text, Link } = Typography;

export interface ProductRailProps {
    title: string;
    subtitle?: ReactNode;
    products?: Product[];
    loading?: boolean;
    error?: AxiosError | null;
    skeletonCount?: number;
    emptyText?: string;
    onViewAll?: () => void;
    onProductClick?: (product: Product) => void;
    onAddToCart?: (product: Product) => void;
    onToggleWishlist?: (product: Product) => void;
}

const ProductRail = ({
    title,
    subtitle,
    products,
    loading = false,
    error = null,
    skeletonCount = 4,
    emptyText = "Nothing to show here yet",
    onViewAll,
    onProductClick,
    onAddToCart,
    onToggleWishlist,
}: ProductRailProps) => (
    <section>
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
            }}
        >
            <div>
                <Title level={4} style={{ margin: 0 }}>
                    {title}
                </Title>
                {subtitle && (
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        {subtitle}
                    </Text>
                )}
            </div>
            {onViewAll && (
                <Link onClick={onViewAll} style={{ fontWeight: 500 }}>
                    View all <RightOutlined style={{ fontSize: 10 }} />
                </Link>
            )}
        </div>

        <ProductGrid
            products={products}
            loading={loading}
            error={error}
            skeletonCount={skeletonCount}
            emptyText={emptyText}
            onProductClick={onProductClick}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
        />
    </section>
);

export default ProductRail;
