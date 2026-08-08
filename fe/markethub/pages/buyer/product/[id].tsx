import { useMemo, useState } from "react";
import Head from "next/head";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import {
  Alert,
  App,
  Card,
  Col,
  Descriptions,
  Divider,
  Image,
  InputNumber,
  Rate,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  HeartOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { AxiosError } from "axios";
import { QueryClient, dehydrate } from "@tanstack/react-query";

import AppLayout from "@/components/layout/AppLayout";
import { Breadcrumbs, Button, ProductRail } from "@/components/ui";
import { Crumb, categoryCrumbs } from "@/components/ui/Breadcrumbs";
import { withCloudinaryTransform } from "@/config/cloudinary";
import { fetchCategories, useCategories } from "@/services/category.service";
import {
  Product,
  ProductDetail,
  fetchProduct,
  useProduct,
  useProductFeed,
} from "@/services/product.service";
import serverApi from "@/server/api";
import { QUERY_KEYS } from "@/contants/endPoints";
import {
  DELIVERY_HIGHLIGHTS,
  LOW_STOCK_THRESHOLD,
  RELATED_PRODUCTS_LIMIT,
  RELATED_PRODUCTS_VISIBLE,
} from "@/contants/product";
import { CONTENT_MAX_WIDTH } from "@/contants/layout";
import { getCategoryPath } from "@/utils/category";
import { getProductGalleryUrls } from "@/utils/product";
import { computeDiscount, firstValue, formatCount, formatPrice } from "@/utils/customMethods";

const { Title, Text, Paragraph } = Typography;

const StockTag = ({ stock }: { stock: number }) => {
  if (stock === 0) return <Tag color="red">Out of stock</Tag>;
  if (stock < LOW_STOCK_THRESHOLD) return <Tag color="orange">{`Only ${stock} left`}</Tag>;
  return <Tag color="green">In stock</Tag>;
};

const Gallery = ({ product }: { product: ProductDetail }) => {
  const urls = getProductGalleryUrls(product);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = urls[activeIndex];

  return (
    <Card styles={{ body: { padding: 16 } }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 420,
          background: "#f5f7fb",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {active ? (
          <Image.PreviewGroup items={urls.map((url) => withCloudinaryTransform(url))}>
            <Image
              src={withCloudinaryTransform(active, "w_900,h_900,c_fit,f_auto,q_auto")}
              alt={product.name}
              height={420}
              style={{ objectFit: "contain" }}
            />
          </Image.PreviewGroup>
        ) : (
          <Text type="secondary">No image available</Text>
        )}
      </div>

      {urls.length > 1 && (
        <Space size={8} wrap style={{ marginTop: 16 }}>
          {urls.map((url, index) => (
            <button
              key={url}
              type="button"
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => setActiveIndex(index)}
              style={{
                width: 72,
                height: 72,
                padding: 0,
                borderRadius: 8,
                overflow: "hidden",
                cursor: "pointer",
                background: "#f5f7fb",
                border: `2px solid ${index === activeIndex ? "#1677ff" : "#f0f0f0"}`,
              }}
            >
              <img
                src={withCloudinaryTransform(url, "w_144,h_144,c_fill,f_auto,q_auto")}
                alt={`${product.name} ${index + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </button>
          ))}
        </Space>
      )}
    </Card>
  );
};

interface PurchaseActionsProps {
  stock: number;
  onAddToCart: (quantity: number) => void;
  onBuyNow: (quantity: number) => void;
  onWishlist: () => void;
}

const PurchaseActions = ({ stock, onAddToCart, onBuyNow, onWishlist }: PurchaseActionsProps) => {
  const [quantity, setQuantity] = useState(1);
  const inStock = stock > 0;

  return (
    <>
      <Space size={12} align="center" style={{ marginTop: 24 }} wrap>
        <Text type="secondary">Quantity</Text>
        <InputNumber
          min={1}
          max={Math.max(stock, 1)}
          value={quantity}
          onChange={(value) => setQuantity(value ?? 1)}
          disabled={!inStock}
          size="large"
          style={{ width: 110 }}
        />
      </Space>

      <Row gutter={[12, 12]} style={{ marginTop: 20 }}>
        <Col xs={24} sm={10}>
          <Button
            block
            icon={<ShoppingCartOutlined />}
            disabled={!inStock}
            onClick={() => onAddToCart(quantity)}
          >
            {inStock ? "Add to cart" : "Out of stock"}
          </Button>
        </Col>
        <Col xs={24} sm={10}>
          <Button
            block
            type="default"
            icon={<ThunderboltOutlined />}
            disabled={!inStock}
            onClick={() => onBuyNow(quantity)}
          >
            Buy now
          </Button>
        </Col>
        <Col xs={24} sm={4}>
          <Button block type="default" icon={<HeartOutlined />} onClick={onWishlist} />
        </Col>
      </Row>
    </>
  );
};

export const getServerSideProps = (async ({ params }) => {
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  if (!id) return { notFound: true };

  const queryClient = new QueryClient();

  try {
    await Promise.all([
      queryClient.fetchQuery({
        queryKey: QUERY_KEYS.PRODUCT_DETAIL(id),
        queryFn: () => fetchProduct(id, serverApi),
      }),
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.CATEGORIES,
        queryFn: () => fetchCategories(serverApi),
      }),
    ]);
  } catch (error) {
    if ((error as AxiosError).response?.status === 404) return { notFound: true };
  }

  return { props: { dehydratedState: dehydrate(queryClient) } };
}) satisfies GetServerSideProps;

export default function BuyerProductDetailPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const id = firstValue(router.query.id);

  const { data: product, isLoading, error } = useProduct(id);
  const { data: categories = [] } = useCategories();

  const categoryPath = useMemo(
    () => getCategoryPath(categories, product?.categoryId),
    [categories, product?.categoryId]
  );

  const related = useProductFeed(
    {
      type: "popular",
      limit: RELATED_PRODUCTS_LIMIT,
      ...(product?.categoryId ? { categoryId: product.categoryId } : {}),
    },
    { enabled: Boolean(product?.categoryId) }
  );

  const relatedProducts = (related.data ?? [])
    .filter((item) => item.id !== product?.id)
    .slice(0, RELATED_PRODUCTS_VISIBLE);

  const discount = product ? computeDiscount(product.price, product.mrp) : null;

  const openProduct = (item: Product) => router.push(`/buyer/product/${item.id}`);
  const addToCart = (quantity: number) => {
    if (!product) return;
    message.success(`${quantity} × ${product.name} added to cart`);
  };
  const buyNow = (quantity: number) => {
    addToCart(quantity);
    router.push("/account/cart");
  };

  const crumbs: Crumb[] = [
    { label: "Home", href: "/buyer/dashboard" },
    { label: "Products", href: "/buyer/products" },
    ...categoryCrumbs(categoryPath),
    ...(product ? [{ label: product.name }] : []),
  ];

  return (
    <AppLayout
      contentStyle={{ maxWidth: CONTENT_MAX_WIDTH }}
      cartCount={0}
      onCartClick={() => router.push("/account/cart")}
      onSearch={(term) => router.push(`/buyer/products?q=${encodeURIComponent(term)}`)}
      onCategorySelect={(category) => router.push(`/buyer/products?categoryId=${category.id}`)}
    >
      <Head>
        <title>{product ? `${product.name} · MarketHub` : "Product · MarketHub"}</title>
        {product?.description && <meta name="description" content={product.description} />}
      </Head>

      <Breadcrumbs items={crumbs} />

      {error && (
        <Alert
          type="error"
          showIcon
          message="Could not load this product"
          description="The listing may have been removed or is temporarily unavailable."
          action={
            <Button size="small" onClick={() => router.push("/buyer/products")}>
              Browse products
            </Button>
          }
        />
      )}

      {isLoading && !product && (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={10}>
            <Card>
              <Skeleton.Image active style={{ width: "100%", height: 420 }} />
            </Card>
          </Col>
          <Col xs={24} lg={14}>
            <Card>
              <Skeleton active paragraph={{ rows: 10 }} />
            </Card>
          </Col>
        </Row>
      )}

      {product && (
        <>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={10}>
              <Gallery key={product.id} product={product} />
            </Col>

            <Col xs={24} lg={14}>
              <Card styles={{ body: { padding: 24 } }}>
                <Space size={8} wrap style={{ marginBottom: 12 }}>
                  {product.categoryName && <Tag color="cyan">{product.categoryName}</Tag>}
                  <StockTag stock={product.stock} />
                </Space>

                <Title level={3} style={{ margin: 0 }}>
                  {product.name}
                </Title>

                <Space size={10} style={{ marginTop: 10 }} wrap>
                  <Space size={6}>
                    <ShopOutlined style={{ color: "#722ed1" }} />
                    <Text type="secondary">
                      Sold by {product.sellerName || `Seller #${product.sellerId}`}
                    </Text>
                  </Space>
                  {product.reviewsCount > 0 ? (
                    <Space size={6}>
                      <Rate disabled allowHalf value={product.averageRating} style={{ fontSize: 14 }} />
                      <Text type="secondary">
                        {product.averageRating.toFixed(1)} · {formatCount(product.reviewsCount)}{" "}
                        reviews
                      </Text>
                    </Space>
                  ) : (
                    <Text type="secondary">No reviews yet</Text>
                  )}
                </Space>

                <Divider style={{ margin: "20px 0" }} />

                <Space size={12} align="baseline" wrap>
                  <Title level={2} style={{ margin: 0 }}>
                    {formatPrice(product.price, "INR")}
                  </Title>
                  {discount != null && (
                    <>
                      <Text delete type="secondary" style={{ fontSize: 16 }}>
                        {formatPrice(product.mrp, "INR")}
                      </Text>
                      <Tag color="red" style={{ margin: 0 }}>{`${discount}% off`}</Tag>
                    </>
                  )}
                </Space>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Inclusive of all taxes
                  </Text>
                </div>

                <PurchaseActions
                  key={product.id}
                  stock={product.stock}
                  onAddToCart={addToCart}
                  onBuyNow={buyNow}
                  onWishlist={() => message.info(`${product.name} saved for later`)}
                />

                <Row gutter={[12, 12]} style={{ marginTop: 24 }}>
                  {DELIVERY_HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
                    <Col key={title} xs={24} sm={8}>
                      <Space size={10} align="start">
                        <span style={{ color: "#1677ff", fontSize: 18 }}>
                          <Icon />
                        </span>
                        <div>
                          <Text strong style={{ display: "block", fontSize: 13 }}>
                            {title}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {text}
                          </Text>
                        </div>
                      </Space>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={14}>
              <Card title="About this product" styles={{ body: { padding: 24 } }}>
                {product.description ? (
                  <Paragraph style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                    {product.description}
                  </Paragraph>
                ) : (
                  <Text type="secondary">The seller has not added a description yet.</Text>
                )}
              </Card>
            </Col>
            <Col xs={24} lg={10}>
              <Card title="Product details" styles={{ body: { padding: 0 } }}>
                <Descriptions
                  column={1}
                  size="small"
                  colon={false}
                  bordered
                  items={[
                    { key: "code", label: "Product code", children: `#${product.id}` },
                    {
                      key: "category",
                      label: "Category",
                      children: product.categoryName || "Uncategorised",
                    },
                    {
                      key: "seller",
                      label: "Seller",
                      children: product.sellerName || `#${product.sellerId}`,
                    },
                    {
                      key: "stock",
                      label: "Availability",
                      children: <StockTag stock={product.stock} />,
                    },
                    {
                      key: "mrp",
                      label: "MRP",
                      children: product.mrp != null ? formatPrice(product.mrp, "INR") : "—",
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>

          {product.categoryId && (
            <div style={{ marginTop: 40 }}>
              <ProductRail
                title="You may also like"
                subtitle={`More from ${product.categoryName || "this category"}`}
                products={relatedProducts}
                loading={related.isLoading}
                error={related.error}
                skeletonCount={RELATED_PRODUCTS_VISIBLE}
                emptyText="No similar products yet"
                onViewAll={() => router.push(`/buyer/products?categoryId=${product.categoryId}`)}
                onProductClick={openProduct}
                onAddToCart={(item) => message.success(`${item.name} added to cart`)}
                onToggleWishlist={(item) => message.info(`${item.name} saved for later`)}
              />
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
