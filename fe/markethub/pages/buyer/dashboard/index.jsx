import { useRouter } from "next/router";
import { Avatar, Col, Layout, Row, Typography } from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  HeartOutlined,
  LogoutOutlined,
  RightOutlined,
} from "@ant-design/icons";

import Header from "@/components/layout/Header";
import { BannerCarousel, ProductCard } from "@/components/ui";
import {
  DASHBOARD_BANNERS,
  RECOMMENDED_PRODUCTS,
  BEST_DEALS,
  BRAND_HIGHLIGHTS,
} from "@/utils/dummy";

const { Content } = Layout;
const { Title, Text, Link } = Typography;

const SectionHeader = ({ title, onViewAll }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    }}
  >
    <Title level={4} style={{ margin: 0 }}>{title}</Title>
    {onViewAll && (
      <Link onClick={onViewAll} style={{ fontWeight: 500 }}>
        View all <RightOutlined style={{ fontSize: 10 }} />
      </Link>
    )}
  </div>
);

const ProductGrid = ({ products, onProductClick, onAddToCart }) => (
  <Row gutter={[16, 16]}>
    {products.map((product) => (
      <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
        <ProductCard
          product={product}
          onClick={onProductClick}
          onAddToCart={onAddToCart}
          onToggleWishlist={(p) => console.log("wishlist:", p.id)}
        />
      </Col>
    ))}
  </Row>
);

const BrandStrip = ({ brands, onBrandClick }) => (
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

  const profileMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "My Profile",
      onClick: () => router.push("/profile"),
    },
    {
      key: "orders",
      icon: <ShoppingOutlined />,
      label: "My Orders",
      onClick: () => router.push("/buyer/orders"),
    },
    {
      key: "wishlist",
      icon: <HeartOutlined />,
      label: "Wishlist",
      onClick: () => router.push("/buyer/wishlist"),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Log out",
      danger: true,
      onClick: () => router.push("/auth/login"),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fb" }}>
      <Header
        user={{ name: "Buyer" }}
        profileMenuItems={profileMenuItems}
        onSearch={(term) => console.log("search:", term)}
        onChangeLocation={(loc) => console.log("location:", loc)}
      />
      <Content>
        <div style={{ padding: "24px 24px 0" }}>
          <BannerCarousel banners={DASHBOARD_BANNERS} height={320} controls="both" />
        </div>
        <div style={{ padding: 24, maxWidth: 1280, width: "100%", margin: "0 auto" }}>
          <Title level={3} style={{ marginTop: 8 }}>Welcome to MarketHub</Title>
          <Text type="secondary">Discover products curated just for you.</Text>

          <section style={{ marginTop: 32 }}>
            <SectionHeader
              title="Recommended for you"
              onViewAll={() => router.push("/buyer/recommended")}
            />
            <ProductGrid
              products={RECOMMENDED_PRODUCTS}
              onProductClick={(p) => router.push(`/buyer/product/${p.id}`)}
              onAddToCart={(p) => console.log("add to cart:", p.id)}
            />
          </section>

          <section style={{ marginTop: 40 }}>
            <SectionHeader
              title="Best deals for today"
              onViewAll={() => router.push("/buyer/deals")}
            />
            <ProductGrid
              products={BEST_DEALS}
              onProductClick={(p) => router.push(`/buyer/product/${p.id}`)}
              onAddToCart={(p) => console.log("add to cart:", p.id)}
            />
          </section>

          <section style={{ marginTop: 40, marginBottom: 24 }}>
            <SectionHeader
              title="Brand highlights"
              onViewAll={() => router.push("/buyer/brands")}
            />
            <BrandStrip
              brands={BRAND_HIGHLIGHTS}
              onBrandClick={(b) => router.push(`/buyer/brand/${b.id}`)}
            />
          </section>
        </div>
      </Content>
    </Layout>
  );
}
