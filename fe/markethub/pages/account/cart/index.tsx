import { useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Affix,
  Alert,
  App,
  Card,
  Col,
  Divider,
  Empty,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

import AppLayout from "@/components/layout/AppLayout";
import { Breadcrumbs, Button } from "@/components/ui";
import { Crumb } from "@/components/ui/Breadcrumbs";
import { withCloudinaryTransform } from "@/config/cloudinary";
import { useSession } from "@/config/session";
import {
  CartItem,
  useBuyerCart,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/services/cart.service";
import { computeCheckoutPricing } from "@/utils/checkout";
import { TAX_RATE } from "@/contants/checkout";
import { CONTENT_MAX_WIDTH } from "@/contants/layout";
import { computeDiscount, formatPrice, getApiErrorMessage } from "@/utils/customMethods";

const { Title, Text } = Typography;

interface CartLineProps {
  item: CartItem;
  busy: boolean;
  onQuantityChange: (item: CartItem, quantity: number) => void;
  onRemove: (item: CartItem) => void;
  onOpen: (item: CartItem) => void;
}

const CartLine = ({ item, busy, onQuantityChange, onRemove, onOpen }: CartLineProps) => {
  const discount = computeDiscount(item.price, item.mrp);
  const atStockLimit = item.quantity >= item.stock;

  return (
    <div style={{ padding: 16 }}>
      <Row gutter={[16, 12]} align="top">
        <Col xs={6} sm={4}>
          <div
            onClick={() => onOpen(item)}
            style={{
              aspectRatio: "1 / 1",
              borderRadius: 8,
              overflow: "hidden",
              background: "#f5f7fb",
              cursor: "pointer",
            }}
          >
            {item.primaryImageUrl ? (
              <img
                src={withCloudinaryTransform(item.primaryImageUrl, "w_240,h_240,c_fill,f_auto,q_auto")}
                alt={item.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : null}
          </div>
        </Col>

        <Col xs={18} sm={20}>
          <Row justify="space-between" align="top" gutter={[8, 8]}>
            <Col flex="auto" style={{ minWidth: 0 }}>
              <Text
                strong
                ellipsis
                style={{ display: "block", cursor: "pointer" }}
                onClick={() => onOpen(item)}
              >
                {item.name}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Sold by {item.sellerName || `Seller #${item.sellerId}`}
              </Text>

              {!item.available && (
                <div style={{ marginTop: 4 }}>
                  <Tag color="red">
                    {item.status === "approved" ? "Out of stock" : "No longer available"}
                  </Tag>
                </div>
              )}

              <Space size={8} align="baseline" style={{ marginTop: 8 }} wrap>
                <Text strong style={{ fontSize: 16 }}>
                  {formatPrice(item.price, "INR")}
                </Text>
                {discount != null && (
                  <>
                    <Text delete type="secondary" style={{ fontSize: 13 }}>
                      {formatPrice(item.mrp, "INR")}
                    </Text>
                    <Text style={{ color: "#52c41a", fontSize: 13 }}>{discount}% off</Text>
                  </>
                )}
              </Space>
            </Col>
            <Col>
              <Text strong>{formatPrice(item.lineTotal, "INR")}</Text>
            </Col>
          </Row>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 12,
            }}
          >
            <Space.Compact>
              <Button
                size="small"
                type="default"
                icon={<MinusOutlined />}
                disabled={busy || !item.available || item.quantity <= 1}
                onClick={() => onQuantityChange(item, item.quantity - 1)}
              />
              <Button size="small" type="default" style={{ pointerEvents: "none", minWidth: 44 }}>
                {item.quantity}
              </Button>
              <Button
                size="small"
                type="default"
                icon={<PlusOutlined />}
                disabled={busy || !item.available || atStockLimit}
                onClick={() => onQuantityChange(item, item.quantity + 1)}
              />
            </Space.Compact>

            {item.available && atStockLimit && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Only {item.stock} in stock
              </Text>
            )}

            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={busy}
              onClick={() => onRemove(item)}
            >
              Remove
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default function BuyerCartPage() {
  const router = useRouter();
  const { modal, message } = App.useApp();
  const { status, isAuthenticated } = useSession();

  const { data: cart, isLoading, error } = useBuyerCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();

  const items = useMemo(() => cart?.items ?? [], [cart]);
  const summary = cart?.summary;
  const busy = updateItem.isPending || removeItem.isPending || clearCart.isPending;

  const totals = useMemo(() => computeCheckoutPricing(items), [items]);

  const runMutation = async (action: Promise<unknown>, successText?: string) => {
    try {
      await action;
      if (successText) message.success(successText);
    } catch (err) {
      message.error(getApiErrorMessage(err, "Could not update your cart"));
    }
  };

  const handleQuantityChange = (item: CartItem, quantity: number) =>
    runMutation(updateItem.mutateAsync({ productId: item.productId, quantity }));

  const handleRemove = (item: CartItem) =>
    modal.confirm({
      title: `Remove ${item.name}?`,
      content: "This item will be removed from your cart.",
      okText: "Remove",
      okButtonProps: { danger: true },
      cancelText: "Keep",
      onOk: () => runMutation(removeItem.mutateAsync(item.productId), "Removed from cart"),
    });

  const handleClear = () =>
    modal.confirm({
      title: "Empty your cart?",
      content: "All items will be removed.",
      okText: "Empty cart",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: () => runMutation(clearCart.mutateAsync(), "Cart emptied"),
    });

  const handleCheckout = () => {
    if (!totals.totalQuantity) {
      message.warning("No items available to checkout");
      return;
    }
    router.push("/account/checkout");
  };

  const crumbs: Crumb[] = [
    { label: "Home", href: "/buyer/dashboard" },
    { label: "My cart" },
  ];

  const sessionLoading = status === "loading";
  const showSignedOut = !sessionLoading && !isAuthenticated;
  const showLoading = sessionLoading || isLoading;
  const isEmpty = !showLoading && !error && items.length === 0;

  return (
    <AppLayout
      contentStyle={{ maxWidth: CONTENT_MAX_WIDTH }}
      cartCount={summary?.totalQuantity ?? 0}
      onCartClick={() => router.push("/account/cart")}
      onSearch={(term) => router.push(`/buyer/products?q=${encodeURIComponent(term)}`)}
      onCategorySelect={(category) => router.push(`/buyer/products?categoryId=${category.id}`)}
    >
      <Head>
        <title>My cart · MarketHub</title>
      </Head>

      <Breadcrumbs items={crumbs} style={{ marginBottom: 12 }} />

      <Row align="middle" justify="space-between" gutter={[16, 8]}>
        <Col>
          <Title level={3} style={{ marginTop: 0, marginBottom: 4 }}>
            My Cart
          </Title>
          <Text type="secondary">
            {items.length
              ? `${items.length} item${items.length > 1 ? "s" : ""} in your cart`
              : "Your cart is empty."}
          </Text>
        </Col>
        {items.length > 0 && (
          <Col>
            <Button type="default" danger disabled={busy} onClick={handleClear}>
              Empty cart
            </Button>
          </Col>
        )}
      </Row>

      {showSignedOut && (
        <Card style={{ marginTop: 24 }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Sign in to see the items in your cart"
          >
            <Button onClick={() => router.push("/auth/login")}>Sign in</Button>
          </Empty>
        </Card>
      )}

      {!showSignedOut && error && (
        <Alert
          type="error"
          showIcon
          style={{ marginTop: 24 }}
          message={getApiErrorMessage(error, "Could not load your cart")}
        />
      )}

      {!showSignedOut && showLoading && (
        <Card style={{ marginTop: 24 }}>
          <Skeleton active avatar paragraph={{ rows: 6 }} />
        </Card>
      )}

      {!showSignedOut && isEmpty && (
        <Card style={{ marginTop: 24 }}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Your cart is empty">
            <Button icon={<ShoppingOutlined />} onClick={() => router.push("/buyer/products")}>
              Continue shopping
            </Button>
          </Empty>
        </Card>
      )}

      {!showSignedOut && items.length > 0 && (
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={15}>
            {summary != null && summary.unavailableCount > 0 && (
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
                message={`${summary.unavailableCount} item${
                  summary.unavailableCount > 1 ? "s are" : " is"
                } unavailable and excluded from your total`}
              />
            )}

            <Card title={`Items (${items.length})`} styles={{ body: { padding: 0 } }}>
              {items.map((item, index) => (
                <div key={item.productId}>
                  <CartLine
                    item={item}
                    busy={busy}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                    onOpen={(cartItem) => router.push(`/buyer/product/${cartItem.productId}`)}
                  />
                  {index < items.length - 1 && <Divider style={{ margin: 0 }} />}
                </div>
              ))}
            </Card>
          </Col>

          <Col xs={24} lg={9}>
            <Affix offsetTop={24}>
              <div>

                <Card
                  title="Order summary"
                  styles={{ body: { padding: 16 } }}
                >
                  <Space direction="vertical" size={10} style={{ width: "100%" }}>
                    <Row justify="space-between">
                      <Text type="secondary">
                        Price ({totals.totalQuantity} item{totals.totalQuantity > 1 ? "s" : ""})
                      </Text>
                      <Text>{formatPrice(totals.mrpTotal, "INR")}</Text>
                    </Row>
                    {totals.productDiscount > 0 && (
                      <Row justify="space-between">
                        <Text type="secondary">Discount</Text>
                        <Text style={{ color: "#52c41a" }}>
                          − {formatPrice(totals.productDiscount, "INR")}
                        </Text>
                      </Row>
                    )}
                    <Row justify="space-between">
                      <Text type="secondary">Delivery</Text>
                      <Text style={totals.shippingCost === 0 ? { color: "#52c41a" } : undefined}>
                        {totals.shippingCost === 0
                          ? "FREE"
                          : formatPrice(totals.shippingCost, "INR")}
                      </Text>
                    </Row>
                    <Row justify="space-between">
                      <Text type="secondary">Tax ({Math.round(TAX_RATE * 100)}%)</Text>
                      <Text>{formatPrice(totals.tax, "INR")}</Text>
                    </Row>
                    <Divider style={{ margin: "4px 0" }} />
                    <Row justify="space-between" align="middle">
                      <Title level={5} style={{ margin: 0 }}>
                        Total
                      </Title>
                      <Title level={4} style={{ margin: 0 }}>
                        {formatPrice(totals.total, "INR")}
                      </Title>
                    </Row>
                    {totals.productDiscount > 0 && (
                      <Text style={{ color: "#52c41a", fontSize: 12 }}>
                        You save {formatPrice(totals.productDiscount, "INR")} on this order
                      </Text>
                    )}
                  </Space>

                  <Button
                    block
                    style={{ marginTop: 16 }}
                    disabled={busy || totals.totalQuantity === 0}
                    onClick={handleCheckout}
                  >
                    Proceed to checkout
                  </Button>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 12,
                      color: "#8c8c8c",
                      fontSize: 12,
                    }}
                  >
                    <SafetyCertificateOutlined />
                    <span>Safe and secure payments</span>
                  </div>
                </Card>
              </div>
            </Affix>
          </Col>
        </Row>
      )}
    </AppLayout>
  );
}
