import { ReactNode } from "react";
import { Alert, Card, Col, Empty, Row, Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { AxiosError } from "axios";

import ProductCard from "./ProductCard";
import { Product } from "@/services/product.service";
import { toProductCardModel } from "@/utils/product";
import { getApiErrorMessage } from "@/utils/customMethods";

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

const COLUMN_SPANS = { xs: 24, sm: 12, md: 8, lg: 6 } as const;

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
}: ProductRailProps) => {
    const items = products ?? [];

    return (
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

            {error && (
                <Alert
                    type="error"
                    showIcon
                    message={getApiErrorMessage(error, "Could not load products")}
                />
            )}

            {!error && loading && (
                <Row gutter={[16, 16]}>
                    {Array.from({ length: skeletonCount }).map((_, index) => (
                        <Col key={index} {...COLUMN_SPANS}>
                            <Card loading style={{ width: "100%" }} />
                        </Col>
                    ))}
                </Row>
            )}

            {!error && !loading && items.length === 0 && (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />
            )}

            {!error && !loading && items.length > 0 && (
                <Row gutter={[16, 16]}>
                    {items.map((product) => (
                        <Col key={product.id} {...COLUMN_SPANS}>
                            <ProductCard
                                product={toProductCardModel(product)}
                                onClick={onProductClick ? () => onProductClick(product) : undefined}
                                onAddToCart={onAddToCart ? () => onAddToCart(product) : undefined}
                                onToggleWishlist={
                                    onToggleWishlist ? () => onToggleWishlist(product) : undefined
                                }
                            />
                        </Col>
                    ))}
                </Row>
            )}
        </section>
    );
};

export default ProductRail;
