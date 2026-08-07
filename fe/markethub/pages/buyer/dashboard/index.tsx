import { useRouter } from "next/router";
import { Avatar, Col, Row, Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";

import AppLayout from "@/components/layout/AppLayout";
import { BannerCarousel, ProductRail } from "@/components/ui";
import { Product, useProductFeed } from "@/services/product.service";
import { DASHBOARD_BANNERS, BRAND_HIGHLIGHTS } from "@/utils/dummy";

const { Title, Text, Link } = Typography;

const RAIL_SIZE = 8;

interface Brand {
  id: string;
  name: string;
  image: string;
  tagline?: string;
}

interface BrandStripProps {
  brands: Brand[];
  onBrandClick?: (brand: Brand) => void;
}

const BrandStrip = ({ brands, onBrandClick }: BrandStripProps) => (
  <Row gutter={[16, 16]}>
    {brands.map((brand) => (
      <Col key={brand.id} xs={12} sm={8} md={6} lg={4}>
        <div
          onClick={() => onBrandClick?.(brand)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 16,
            background: "#fff",
            borderRadius: 8,
            border: "1px solid #f0f0f0",
            cursor: "pointer",
            transition: "box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <Avatar src={brand.image} size={72} />
          <Text strong style={{ marginTop: 12 }}>{brand.name}</Text>
          {brand.tagline && (
            <Text type="secondary" style={{ fontSize: 12 }}>{brand.tagline}</Text>
          )}
        </div>
      </Col>
    ))}
  </Row>
);

export default function BuyerDashboardPage() {
  const router = useRouter();

  const deals = useProductFeed({ type: "deals", limit: RAIL_SIZE });
  const trending = useProductFeed({ type: "trending", limit: RAIL_SIZE });
  const popular = useProductFeed({ type: "popular", limit: RAIL_SIZE });

  const openProduct = (product: Product) => router.push(`/buyer/product/${product.id}`);
  const addToCart = (product: Product) => console.log("add to cart:", product.id);
  const toggleWishlist = (product: Product) => console.log("wishlist:", product.id);

  const railHandlers = {
    onProductClick: openProduct,
    onAddToCart: addToCart,
    onToggleWishlist: toggleWishlist,
    skeletonCount: RAIL_SIZE,
  };

  return (
    <AppLayout
      contentStyle={{ padding: 0, maxWidth: "none" }}
      cartCount={0}
      onCartClick={() => router.push("/account/cart")}
      onSearch={(term) => router.push(`/buyer/products?q=${encodeURIComponent(term)}`)}
      onChangeLocation={(loc) => console.log("location:", loc)}
      onCategorySelect={(category) =>
        router.push(`/buyer/products?categoryId=${category.id}`)
      }
    >
        <div style={{ padding: "24px 24px 0" }}>
          <BannerCarousel banners={DASHBOARD_BANNERS} height={320} controls="both" />
        </div>
        <div style={{ padding: 24, maxWidth: 1280, width: "100%", margin: "0 auto" }}>
          <Title level={3} style={{ marginTop: 8 }}>Welcome to MarketHub</Title>
          <Text type="secondary">Discover products curated just for you.</Text>

          <div style={{ marginTop: 32 }}>
            <ProductRail
              title="Recommended for you"
              subtitle="Powered by top rated picks until recommendations go live"
              products={popular.data}
              loading={popular.isLoading}
              error={popular.error}
              emptyText="No products to recommend yet"
              onViewAll={() => router.push("/buyer/products?sort=popular")}
              {...railHandlers}
            />
          </div>

          <div style={{ marginTop: 40 }}>
            <ProductRail
              title="Best deals for today"
              subtitle="Biggest savings against MRP right now"
              products={deals.data}
              loading={deals.isLoading}
              error={deals.error}
              emptyText="No discounted products right now"
              onViewAll={() => router.push("/buyer/products?sort=deals")}
              {...railHandlers}
            />
          </div>

          <div style={{ marginTop: 40 }}>
            <ProductRail
              title="Trending this week"
              subtitle="Most ordered by shoppers over the last 7 days"
              products={trending.data}
              loading={trending.isLoading}
              error={trending.error}
              emptyText="No trending products yet"
              onViewAll={() => router.push("/buyer/products?sort=trending")}
              {...railHandlers}
            />
          </div>

          <section style={{ marginTop: 40, marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <Title level={4} style={{ margin: 0 }}>Brand highlights</Title>
              <Link onClick={() => router.push("/buyer/brands")} style={{ fontWeight: 500 }}>
                View all <RightOutlined style={{ fontSize: 10 }} />
              </Link>
            </div>
            <BrandStrip
              brands={BRAND_HIGHLIGHTS}
              onBrandClick={(b) => router.push(`/buyer/brand/${b.id}`)}
            />
          </section>
        </div>
    </AppLayout>
  );
}
