import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  App,
  Affix,
  Card,
  Col,
  Divider,
  Empty,
  Image,
  Input as AntInput,
  Layout,
  Radio,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  EnvironmentOutlined,
  HeartOutlined,
  HomeOutlined,
  LogoutOutlined,
  MinusOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  ShoppingOutlined,
  TagOutlined,
  UserOutlined,
} from "@ant-design/icons";

import Header from "@/components/layout/Header";
import { Button } from "@/components/ui";
import { BUYER_CART, CART_COUPONS, USER_PROFILE } from "@/utils/dummy";
import { formatPrice } from "@/utils/customMethods";

const { Content } = Layout;
const { Title, Text } = Typography;

const computeTotals = (items, coupon) => {
  const eligible = items.filter((item) => item.inStock !== false);
  const subtotal = eligible.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const mrpTotal = eligible.reduce(
    (sum, item) => sum + (item.originalPrice || item.price) * item.quantity,
    0
  );
  const productDiscount = Math.max(0, mrpTotal - subtotal);

  let couponDiscount = 0;
  let shipping = subtotal > 0 && subtotal < 999 ? 49 : 0;

  if (coupon && subtotal > 0) {
    if (coupon.type === "percent") {
      couponDiscount = Math.min(
        Math.round((subtotal * coupon.value) / 100),
        coupon.maxDiscount || Infinity
      );
    } else if (coupon.type === "flat") {
      if (!coupon.minOrder || subtotal >= coupon.minOrder) {
        couponDiscount = coupon.value;
      }
    } else if (coupon.type === "shipping") {
      shipping = 0;
    }
  }

  const total = Math.max(0, subtotal - couponDiscount + shipping);
  return { subtotal, mrpTotal, productDiscount, couponDiscount, shipping, total };
};

export default function BuyerCartPage() {
  const router = useRouter();
  const { modal, message } = App.useApp();
  const [items, setItems] = useState(BUYER_CART);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const user = USER_PROFILE;
  const [addressId, setAddressId] = useState(
    user.addresses.find((a) => a.isDefault)?.id || user.addresses[0]?.id
  );

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

  const totals = useMemo(
    () => computeTotals(items, appliedCoupon),
    [items, appliedCoupon]
  );

  const totalQuantity = useMemo(
    () =>
      items
        .filter((item) => item.inStock !== false)
        .reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const handleQuantity = (id, delta) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next = item.quantity + delta;
        if (next < 1) return item;
        if (item.maxQuantity && next > item.maxQuantity) {
          message.info(`Only ${item.maxQuantity} available`);
          return item;
        }
        return { ...item, quantity: next };
      })
    );
  };

  const handleRemove = (item) => {
    modal.confirm({
      title: `Remove ${item.title}?`,
      content: "This item will be removed from your cart.",
      okText: "Remove",
      okButtonProps: { danger: true },
      cancelText: "Keep",
      onOk: () => {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        message.success("Removed from cart");
      },
    });
  };

  const handleMoveToWishlist = (item) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    message.success("Moved to wishlist");
  };

  const handleApplyCoupon = (code) => {
    const trimmed = (code || couponCode).trim().toUpperCase();
    if (!trimmed) {
      message.warning("Enter a coupon code");
      return;
    }
    const match = CART_COUPONS.find((c) => c.code === trimmed);
    if (!match) {
      message.error("Invalid coupon code");
      return;
    }
    if (match.minOrder && totals.subtotal < match.minOrder) {
      message.warning(
        `Add ${formatPrice(match.minOrder - totals.subtotal, "INR")} more to use ${match.code}`
      );
      return;
    }
    setAppliedCoupon(match);
    setCouponCode(match.code);
    message.success(`${match.code} applied`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    message.success("Coupon removed");
  };

  const handleCheckout = () => {
    const inStockCount = items.filter((i) => i.inStock !== false).length;
    if (!inStockCount) {
      message.warning("No items available to checkout");
      return;
    }
    message.success(`Placing order for ${formatPrice(totals.total, "INR")}`);
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fb" }}>
      <Header
        user={{ name: `${user.firstName} ${user.lastName}` }}
        profileMenuItems={profileMenuItems}
        cartCount={totalQuantity}
        onCartClick={() => router.push("/buyer/cart")}
        onSearch={(term) => console.log("search:", term)}
        onChangeLocation={(loc) => console.log("location:", loc)}
      />
      <Content>
        <div
          style={{
            padding: 24,
            maxWidth: 1280,
            width: "100%",
            margin: "0 auto",
          }}
        >
          <Title level={3} style={{ marginTop: 8 }}>
            My Cart
          </Title>
          <Text type="secondary">
            {items.length
              ? `${items.length} item${items.length > 1 ? "s" : ""} in your cart`
              : "Your cart is empty."}
          </Text>

          {items.length === 0 ? (
            <Card style={{ marginTop: 24 }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Your cart is empty"
              >
                <Button onClick={() => router.push("/buyer/dashboard")}>
                  Continue shopping
                </Button>
              </Empty>
            </Card>
          ) : (
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
              <Col xs={24} lg={15}>
                <Card
                  title={
                    <Space>
                      <EnvironmentOutlined />
                      <span>Deliver to</span>
                    </Space>
                  }
                  styles={{ body: { padding: 16 } }}
                >
                  <Radio.Group
                    value={addressId}
                    onChange={(e) => setAddressId(e.target.value)}
                    style={{ width: "100%" }}
                  >
                    <Space direction="vertical" size={12} style={{ width: "100%" }}>
                      {user.addresses.map((addr) => (
                        <Radio
                          key={addr.id}
                          value={addr.id}
                          style={{
                            display: "block",
                            padding: 12,
                            border: "1px solid #f0f0f0",
                            borderRadius: 8,
                            width: "100%",
                          }}
                        >
                          <Space size={6}>
                            {addr.label === "Home" ? (
                              <HomeOutlined />
                            ) : (
                              <EnvironmentOutlined />
                            )}
                            <Text strong>{addr.label}</Text>
                            {addr.isDefault && (
                              <Tag color="blue" style={{ marginLeft: 4 }}>
                                Default
                              </Tag>
                            )}
                          </Space>
                          <div style={{ fontSize: 13, marginTop: 4 }}>
                            {addr.name} &middot; {addr.phone}
                          </div>
                          <Text
                            type="secondary"
                            style={{ fontSize: 12, display: "block" }}
                          >
                            {addr.line1}
                            {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city},{" "}
                            {addr.state} {addr.pincode}
                          </Text>
                        </Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                </Card>

                <Card
                  style={{ marginTop: 16 }}
                  title={`Items (${items.length})`}
                  styles={{ body: { padding: 0 } }}
                >
                  {items.map((item, idx) => (
                    <div key={item.id}>
                      <div style={{ padding: 16 }}>
                        <Row gutter={[16, 12]} align="top">
                          <Col xs={6} sm={4}>
                            <Image
                              src={item.image}
                              alt={item.title}
                              preview={false}
                              style={{
                                width: "100%",
                                aspectRatio: "1 / 1",
                                objectFit: "cover",
                                borderRadius: 8,
                              }}
                            />
                          </Col>
                          <Col xs={18} sm={20}>
                            <Row
                              justify="space-between"
                              align="top"
                              gutter={[8, 8]}
                            >
                              <Col flex="auto" style={{ minWidth: 0 }}>
                                <Text
                                  strong
                                  ellipsis
                                  style={{ display: "block" }}
                                >
                                  {item.title}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Sold by {item.seller}
                                </Text>
                                {item.inStock === false && (
                                  <div style={{ marginTop: 4 }}>
                                    <Tag color="red">Out of stock</Tag>
                                  </div>
                                )}
                                <Space
                                  size={8}
                                  align="baseline"
                                  style={{ marginTop: 8 }}
                                  wrap
                                >
                                  <Text strong style={{ fontSize: 16 }}>
                                    {formatPrice(item.price, "INR")}
                                  </Text>
                                  {item.originalPrice &&
                                    item.originalPrice > item.price && (
                                      <>
                                        <Text
                                          delete
                                          type="secondary"
                                          style={{ fontSize: 13 }}
                                        >
                                          {formatPrice(
                                            item.originalPrice,
                                            "INR"
                                          )}
                                        </Text>
                                        <Text
                                          style={{
                                            color: "#52c41a",
                                            fontSize: 13,
                                          }}
                                        >
                                          {Math.round(
                                            ((item.originalPrice - item.price) /
                                              item.originalPrice) *
                                              100
                                          )}
                                          % off
                                        </Text>
                                      </>
                                    )}
                                </Space>
                              </Col>
                              <Col>
                                <Text strong>
                                  {formatPrice(
                                    item.price * item.quantity,
                                    "INR"
                                  )}
                                </Text>
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
                                  icon={<MinusOutlined />}
                                  disabled={
                                    item.quantity <= 1 || item.inStock === false
                                  }
                                  onClick={() => handleQuantity(item.id, -1)}
                                />
                                <Button
                                  size="small"
                                  style={{
                                    pointerEvents: "none",
                                    minWidth: 40,
                                  }}
                                >
                                  {item.quantity}
                                </Button>
                                <Button
                                  size="small"
                                  icon={<PlusOutlined />}
                                  disabled={item.inStock === false}
                                  onClick={() => handleQuantity(item.id, 1)}
                                />
                              </Space.Compact>

                              <Button
                                size="small"
                                type="text"
                                icon={<HeartOutlined />}
                                onClick={() => handleMoveToWishlist(item)}
                              >
                                Move to wishlist
                              </Button>
                              <Button
                                size="small"
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleRemove(item)}
                              >
                                Remove
                              </Button>
                            </div>
                          </Col>
                        </Row>
                      </div>
                      {idx < items.length - 1 && (
                        <Divider style={{ margin: 0 }} />
                      )}
                    </div>
                  ))}
                </Card>
              </Col>

              <Col xs={24} lg={9}>
                <Affix offsetTop={24}>
                  <div>
                    <Card
                      title={
                        <Space>
                          <TagOutlined />
                          <span>Coupons</span>
                        </Space>
                      }
                      styles={{ body: { padding: 16 } }}
                    >
                      {appliedCoupon ? (
                        <div
                          style={{
                            padding: 12,
                            border: "1px dashed #52c41a",
                            borderRadius: 8,
                            background: "#f6ffed",
                          }}
                        >
                          <Space
                            style={{
                              width: "100%",
                              justifyContent: "space-between",
                            }}
                          >
                            <div>
                              <Text strong style={{ color: "#389e0d" }}>
                                {appliedCoupon.code}
                              </Text>
                              <div style={{ fontSize: 12, color: "#595959" }}>
                                {appliedCoupon.description}
                              </div>
                            </div>
                            <Button
                              size="small"
                              type="text"
                              danger
                              onClick={handleRemoveCoupon}
                            >
                              Remove
                            </Button>
                          </Space>
                        </div>
                      ) : (
                        <Space.Compact style={{ width: "100%" }}>
                          <AntInput
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) =>
                              setCouponCode(e.target.value.toUpperCase())
                            }
                            onPressEnter={() => handleApplyCoupon()}
                          />
                          <Button onClick={() => handleApplyCoupon()}>
                            Apply
                          </Button>
                        </Space.Compact>
                      )}

                      {!appliedCoupon && (
                        <Space
                          direction="vertical"
                          size={8}
                          style={{ width: "100%", marginTop: 12 }}
                        >
                          {CART_COUPONS.map((c) => (
                            <div
                              key={c.code}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: 8,
                                border: "1px solid #f0f0f0",
                                borderRadius: 8,
                              }}
                            >
                              <div style={{ minWidth: 0 }}>
                                <Text strong style={{ fontSize: 13 }}>
                                  {c.code}
                                </Text>
                                <div
                                  style={{ fontSize: 11, color: "#8c8c8c" }}
                                >
                                  {c.description}
                                </div>
                              </div>
                              <Button
                                size="small"
                                type="link"
                                onClick={() => handleApplyCoupon(c.code)}
                              >
                                Apply
                              </Button>
                            </div>
                          ))}
                        </Space>
                      )}
                    </Card>

                    <Card
                      style={{ marginTop: 16 }}
                      title="Order summary"
                      styles={{ body: { padding: 16 } }}
                    >
                      <Space
                        direction="vertical"
                        size={10}
                        style={{ width: "100%" }}
                      >
                        <Row justify="space-between">
                          <Text type="secondary">
                            Price ({totalQuantity} item
                            {totalQuantity > 1 ? "s" : ""})
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
                        {totals.couponDiscount > 0 && (
                          <Row justify="space-between">
                            <Text type="secondary">
                              Coupon ({appliedCoupon?.code})
                            </Text>
                            <Text style={{ color: "#52c41a" }}>
                              − {formatPrice(totals.couponDiscount, "INR")}
                            </Text>
                          </Row>
                        )}
                        <Row justify="space-between">
                          <Text type="secondary">Delivery</Text>
                          <Text
                            style={
                              totals.shipping === 0
                                ? { color: "#52c41a" }
                                : undefined
                            }
                          >
                            {totals.shipping === 0
                              ? "FREE"
                              : formatPrice(totals.shipping, "INR")}
                          </Text>
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
                        {totals.productDiscount + totals.couponDiscount > 0 && (
                          <Text style={{ color: "#52c41a", fontSize: 12 }}>
                            You save{" "}
                            {formatPrice(
                              totals.productDiscount + totals.couponDiscount,
                              "INR"
                            )}{" "}
                            on this order
                          </Text>
                        )}
                      </Space>

                      <Button
                        block
                        size="large"
                        style={{ marginTop: 16 }}
                        onClick={handleCheckout}
                        disabled={totalQuantity === 0}
                      >
                        Place order
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
        </div>
      </Content>
    </Layout>
  );
}
