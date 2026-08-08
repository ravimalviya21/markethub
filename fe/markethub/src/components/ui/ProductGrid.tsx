import { Alert, Card, Col, Empty, Row } from "antd";
import { AxiosError } from "axios";

import ProductCard from "./ProductCard";
import { Product } from "@/services/product.service";
import { toProductCardModel } from "@/utils/product";
import { getApiErrorMessage } from "@/utils/customMethods";

export interface ProductGridColumns {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
}

export interface ProductGridProps {
    products?: Product[];
    loading?: boolean;
    error?: AxiosError | null;
    skeletonCount?: number;
    emptyText?: string;
    errorText?: string;
    columns?: ProductGridColumns;
    wishlistedIds?: (number | string)[];
    onProductClick?: (product: Product) => void;
    onAddToCart?: (product: Product) => void;
    onToggleWishlist?: (product: Product) => void;
}

export const DEFAULT_GRID_COLUMNS: ProductGridColumns = { xs: 24, sm: 12, md: 8, lg: 6 };

const ProductGrid = ({
    products,
    loading = false,
    error = null,
    skeletonCount = 4,
    emptyText = "Nothing to show here yet",
    errorText = "Could not load products",
    columns = DEFAULT_GRID_COLUMNS,
    wishlistedIds,
    onProductClick,
    onAddToCart,
    onToggleWishlist,
}: ProductGridProps) => {
    const items = products ?? [];
    const wishlisted = new Set(wishlistedIds ?? []);

    if (error) {
        return <Alert type="error" showIcon message={getApiErrorMessage(error, errorText)} />;
    }

    if (loading) {
        return (
            <Row gutter={[16, 16]}>
                {Array.from({ length: skeletonCount }).map((_, index) => (
                    <Col key={index} {...columns}>
                        <Card loading style={{ width: "100%" }} />
                    </Col>
                ))}
            </Row>
        );
    }

    if (items.length === 0) {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />;
    }

    return (
        <Row gutter={[16, 16]}>
            {items.map((product) => (
                <Col key={product.id} {...columns}>
                    <ProductCard
                        product={toProductCardModel(product)}
                        wishlisted={wishlisted.has(product.id)}
                        onClick={onProductClick ? () => onProductClick(product) : undefined}
                        onAddToCart={onAddToCart ? () => onAddToCart(product) : undefined}
                        onToggleWishlist={
                            onToggleWishlist ? () => onToggleWishlist(product) : undefined
                        }
                    />
                </Col>
            ))}
        </Row>
    );
};

export default ProductGrid;
