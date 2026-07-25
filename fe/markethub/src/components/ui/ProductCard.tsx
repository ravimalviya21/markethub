import { Card, CardProps, Rate, Tag, Tooltip, Typography } from "antd";
import { HeartOutlined, HeartFilled, ShoppingCartOutlined } from "@ant-design/icons";
import Button from "./Button";
import { formatPrice, computeDiscount } from "@/utils/customMethods";

const { Text, Paragraph } = Typography;

export interface Product {
  id: string | number;
  image?: string;
  alt?: string;
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  rating?: number | null;
  reviewCount?: number;
  badge?: string;
  inStock?: boolean;
}

interface ProductCardProps extends Omit<CardProps, "onClick" | "variant"> {
  product: Product | null | undefined;
  currency?: string;
  wishlisted?: boolean;
  loading?: boolean;
  variant?: "default" | "compact";
  onClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
}

const ProductCard = ({
  product,
  currency = "INR",
  wishlisted = false,
  loading = false,
  variant = "default",
  onClick,
  onAddToCart,
  onToggleWishlist,
  style,
  ...rest
}: ProductCardProps) => {
  if (!product) return null;

  const {
    image,
    alt,
    title,
    description,
    price,
    originalPrice,
    rating,
    reviewCount,
    badge,
    inStock = true,
  } = product;

  const resolvedCurrency = product.currency || currency;
  const discount = computeDiscount(price, originalPrice);
  const isCompact = variant === "compact";
  const imageHeight = isCompact ? 160 : 220;

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  const cover = (
    <div
      style={{
        position: "relative",
        height: imageHeight,
        background: "#f5f7fb",
        overflow: "hidden",
      }}
    >
      {image ? (
        <img
          src={image}
          alt={alt || title || "product"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#bfbfbf",
            fontSize: 14,
          }}
        >
          No image
        </div>
      )}

      {(badge || discount) && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            display: "flex",
            gap: 6,
          }}
        >
          {badge && <Tag color="blue" style={{ margin: 0 }}>{badge}</Tag>}
          {discount != null && (
            <Tag color="red" style={{ margin: 0 }}>{`-${discount}%`}</Tag>
          )}
        </div>
      )}

      {!inStock && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            color: "#595959",
            letterSpacing: 1,
          }}
        >
          OUT OF STOCK
        </div>
      )}

      {onToggleWishlist && (
        <Tooltip title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}>
          <button
            type="button"
            onClick={(e) => {
              stopPropagation(e);
              onToggleWishlist(product);
            }}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.92)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: wishlisted ? "#ff4d4f" : "#595959",
              fontSize: 16,
            }}
            aria-label="Toggle wishlist"
          >
            {wishlisted ? <HeartFilled /> : <HeartOutlined />}
          </button>
        </Tooltip>
      )}
    </div>
  );

  return (
    <Card
      hoverable={Boolean(onClick)}
      loading={loading}
      cover={cover}
      onClick={onClick ? () => onClick(product) : undefined}
      styles={{ body: { padding: isCompact ? 12 : 16 } }}
      style={{ width: "100%", overflow: "hidden", ...style }}
      {...rest}
    >
      <Paragraph
        ellipsis={{ rows: 2 }}
        style={{
          margin: 0,
          fontSize: isCompact ? 13 : 14,
          fontWeight: 600,
          minHeight: isCompact ? 34 : 40,
        }}
      >
        {title}
      </Paragraph>

      {description && !isCompact && (
        <Paragraph
          type="secondary"
          ellipsis={{ rows: 2 }}
          style={{ margin: "4px 0 0", fontSize: 12 }}
        >
          {description}
        </Paragraph>
      )}

      {rating != null && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 8,
          }}
        >
          <Rate disabled allowHalf value={rating} style={{ fontSize: 12 }} />
          {reviewCount != null && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              ({reviewCount})
            </Text>
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          marginTop: 8,
          flexWrap: "wrap",
        }}
      >
        <Text strong style={{ fontSize: isCompact ? 15 : 18 }}>
          {formatPrice(price, resolvedCurrency)}
        </Text>
        {originalPrice && originalPrice > price && (
          <Text
            delete
            type="secondary"
            style={{ fontSize: 13 }}
          >
            {formatPrice(originalPrice, resolvedCurrency)}
          </Text>
        )}
      </div>

      {onAddToCart && (
        <Button
          size={isCompact ? "middle" : "large"}
          block
          icon={<ShoppingCartOutlined />}
          disabled={!inStock}
          onClick={(e) => {
            stopPropagation(e);
            onAddToCart(product);
          }}
          style={{ marginTop: 12 }}
        >
          {inStock ? "Add to cart" : "Unavailable"}
        </Button>
      )}
    </Card>
  );
};

export default ProductCard;
