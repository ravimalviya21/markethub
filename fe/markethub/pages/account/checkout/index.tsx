import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Affix,
  Alert,
  App,
  Card,
  Col,
  Divider,
  Empty,
  Radio,
  Result,
  Row,
  Select,
  Skeleton,
  Space,
  Steps,
  Tag,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  EditOutlined,
  EnvironmentOutlined,
  LockOutlined,
  ShopOutlined,
} from "@ant-design/icons";

import AppLayout from "@/components/layout/AppLayout";
import { Breadcrumbs, Button, Input } from "@/components/ui";
import { Crumb } from "@/components/ui/Breadcrumbs";
import { useSession } from "@/config/session";
import { useBuyerCart } from "@/services/cart.service";
import { CreatedOrder, PaymentMethod, useCreateOrder } from "@/services/order.service";
import {
  CHECKOUT_STEPS,
  INDIAN_STATES,
  PAYMENT_OPTIONS,
  RAZORPAY_BRAND_NAME,
  RAZORPAY_THEME_COLOR,
  SHIPPING_ADDRESS_STORAGE_KEY,
  TAX_RATE,
} from "@/contants/checkout";
import { openRazorpayCheckout } from "@/config/razorpay";
import { usePaymentConfig, useFailPayment, useVerifyPayment } from "@/services/payment.service";
import { CONTENT_MAX_WIDTH } from "@/contants/layout";
import { computeCheckoutPricing, toOrderItems } from "@/utils/checkout";
import {
  EMPTY_SHIPPING_ADDRESS,
  ShippingAddressFormValues,
  shippingAddressSchema,
} from "@/validations/checkout.validation";
import { formatCount, formatPrice, getApiErrorMessage } from "@/utils/customMethods";

const { Title, Text, Paragraph } = Typography;

const readStoredAddress = (): ShippingAddressFormValues => {
  if (typeof window === "undefined") return EMPTY_SHIPPING_ADDRESS;
  try {
    const raw = window.localStorage.getItem(SHIPPING_ADDRESS_STORAGE_KEY);
    return raw ? { ...EMPTY_SHIPPING_ADDRESS, ...JSON.parse(raw) } : EMPTY_SHIPPING_ADDRESS;
  } catch {
    return EMPTY_SHIPPING_ADDRESS;
  }
};

const AddressSummary = ({ address }: { address: ShippingAddressFormValues }) => (
  <div style={{ fontSize: 13, lineHeight: 1.7 }}>
    <Text strong>{address.fullName}</Text>
    <div style={{ color: "#595959" }}>{address.phone}</div>
    <div style={{ color: "#595959" }}>
      {address.line1}
      {address.line2 ? `, ${address.line2}` : ""}
    </div>
    <div style={{ color: "#595959" }}>
      {address.city}, {address.state} {address.postalCode}
    </div>
    <div style={{ color: "#595959" }}>{address.country}</div>
  </div>
);

export default function CheckoutPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { status: sessionStatus } = useSession();

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState<ShippingAddressFormValues | null>(null);
  const [payment, setPayment] = useState<PaymentMethod>("razorpay");
  const [paying, setPaying] = useState(false);
  const [placedOrders, setPlacedOrders] = useState<CreatedOrder[] | null>(null);

  const { data: cart, isLoading, error } = useBuyerCart();
  const { user } = useSession();
  const { data: paymentConfig } = usePaymentConfig();
  const createOrder = useCreateOrder();
  const verifyPayment = useVerifyPayment();
  const failPayment = useFailPayment();

  const onlineEnabled = paymentConfig?.enabled ?? false;

  const items = useMemo(() => cart?.items ?? [], [cart]);
  const pricing = useMemo(() => computeCheckoutPricing(items), [items]);
  const unavailableCount = cart?.summary.unavailableCount ?? 0;

  const { control, handleSubmit, reset } = useForm<ShippingAddressFormValues>({
    resolver: yupResolver(shippingAddressSchema),
    defaultValues: EMPTY_SHIPPING_ADDRESS,
    mode: "onTouched",
  });

  useEffect(() => {
    reset(readStoredAddress());
  }, [reset]);

  const handleAddressSubmit = (values: ShippingAddressFormValues) => {
    setAddress(values);
    try {
      window.localStorage.setItem(SHIPPING_ADDRESS_STORAGE_KEY, JSON.stringify(values));
    } catch {}
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const settleSuccess = (orders: CreatedOrder[]) => {
    setPlacedOrders(orders);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const abandonPayment = async (razorpayOrderId: string, note: string) => {
    try {
      await failPayment.mutateAsync({ razorpayOrderId });
    } catch {}
    message.warning(note);
  };

  const handlePlaceOrder = async () => {
    if (!address) return;
    const orderItems = toOrderItems(items);
    if (!orderItems.length) {
      message.warning("No items available to order");
      return;
    }

    const method: PaymentMethod = payment === "razorpay" && onlineEnabled ? "razorpay" : "cod";

    setPaying(true);
    try {
      const result = await createOrder.mutateAsync({
        items: orderItems,
        shippingAddress: { ...address, line2: address.line2 || undefined },
        paymentMethod: method,
      });

      if (method === "cod" || !result.payment) {
        settleSuccess(result.orders);
        return;
      }

      const intent = result.payment;
      const outcome = await openRazorpayCheckout({
        key: intent.keyId,
        amount: intent.amountInPaise,
        currency: intent.currency,
        name: RAZORPAY_BRAND_NAME,
        description: `${result.orders.length} order${result.orders.length > 1 ? "s" : ""}`,
        order_id: intent.razorpayOrderId,
        prefill: {
          name: address.fullName,
          email: user?.email,
          contact: address.phone,
        },
        theme: { color: RAZORPAY_THEME_COLOR },
      });

      if (outcome.status === "dismissed") {
        await abandonPayment(intent.razorpayOrderId, "Payment cancelled, your order was not placed");
        return;
      }

      if (outcome.status === "failed") {
        await abandonPayment(intent.razorpayOrderId, outcome.reason);
        return;
      }

      await verifyPayment.mutateAsync({
        razorpayOrderId: outcome.response.razorpay_order_id,
        razorpayPaymentId: outcome.response.razorpay_payment_id,
        razorpaySignature: outcome.response.razorpay_signature,
      });

      message.success("Payment successful");
      settleSuccess(result.orders);
    } catch (err) {
      message.error(getApiErrorMessage(err, "Could not place your order"));
    } finally {
      setPaying(false);
    }
  };

  const crumbs: Crumb[] = [
    { label: "Home", href: "/buyer/dashboard" },
    { label: "My cart", href: "/account/cart" },
    { label: "Checkout" },
  ];

  const showLoading = sessionStatus === "loading" || isLoading;
  const isEmpty = !showLoading && !error && pricing.itemCount === 0;

  const layoutProps = {
    contentStyle: { maxWidth: CONTENT_MAX_WIDTH },
    cartCount: cart?.summary.totalQuantity ?? 0,
    onCartClick: () => router.push("/account/cart"),
    onSearch: (term: string) => router.push(`/buyer/products?q=${encodeURIComponent(term)}`),
  };

  if (placedOrders) {
    const grandTotal = placedOrders.reduce((sum, order) => sum + order.total, 0);

    return (
      <AppLayout {...layoutProps}>
        <Head>
          <title>Order placed · MarketHub</title>
        </Head>

        <Result
          status="success"
          icon={<CheckCircleOutlined />}
          title="Order placed successfully"
          subTitle={
            placedOrders.length > 1
              ? `Your items ship from ${placedOrders.length} sellers, so we created ${placedOrders.length} orders.`
              : `Order ${placedOrders[0]?.orderNumber}`
          }
          extra={[
            <Button key="orders" onClick={() => router.push("/account/orders")}>
              View my orders
            </Button>,
            <Button
              key="shop"
              type="default"
              onClick={() => router.push("/buyer/products")}
            >
              Continue shopping
            </Button>,
          ]}
        />

        <Card style={{ maxWidth: 640, margin: "0 auto" }} title="Order summary">
          {placedOrders.map((order) => (
            <Row key={order.id} justify="space-between" style={{ marginBottom: 8 }}>
              <Col>
                <Text strong>{order.orderNumber}</Text>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {order.itemCount} item{order.itemCount > 1 ? "s" : ""} · Pending confirmation
                  </Text>
                </div>
              </Col>
              <Col>
                <Text strong>{formatPrice(order.total, "INR")}</Text>
              </Col>
            </Row>
          ))}
          <Divider style={{ margin: "12px 0" }} />
          <Row justify="space-between">
            <Text strong>Total</Text>
            <Text strong>{formatPrice(grandTotal, "INR")}</Text>
          </Row>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout {...layoutProps}>
      <Head>
        <title>Checkout · MarketHub</title>
      </Head>

      <Breadcrumbs items={crumbs} style={{ marginBottom: 12 }} />

      <Title level={3} style={{ marginTop: 0, marginBottom: 4 }}>
        Checkout
      </Title>
      <Text type="secondary">Confirm where your order should go and how you want to pay.</Text>

      {error && (
        <Alert
          type="error"
          showIcon
          style={{ marginTop: 24 }}
          message={getApiErrorMessage(error, "Could not load your cart")}
        />
      )}

      {showLoading && (
        <Card style={{ marginTop: 24 }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      )}

      {isEmpty && (
        <Card style={{ marginTop: 24 }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="You have nothing to check out yet"
          >
            <Button onClick={() => router.push("/buyer/products")}>Browse products</Button>
          </Empty>
        </Card>
      )}

      {!showLoading && !isEmpty && (
        <>
          <Steps
            current={step}
            style={{ marginTop: 24, maxWidth: 640 }}
            items={CHECKOUT_STEPS.map((title) => ({ title }))}
          />

          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={15}>
              {unavailableCount > 0 && (
                <Alert
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                  message={`${unavailableCount} unavailable item${
                    unavailableCount > 1 ? "s" : ""
                  } will not be ordered`}
                />
              )}

              {step === 0 && (
                <Card
                  title={
                    <Space>
                      <EnvironmentOutlined />
                      <span>Shipping address</span>
                    </Space>
                  }
                  styles={{ body: { padding: 24 } }}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Input
                        name="fullName"
                        control={control}
                        label="Full name"
                        placeholder="Ravi Malviya"
                        required
                      />
                    </Col>
                    <Col xs={24} sm={12}>
                      <Input
                        name="phone"
                        control={control}
                        label="Phone"
                        placeholder="9876543210"
                        required
                      />
                    </Col>
                  </Row>

                  <Input
                    name="line1"
                    control={control}
                    label="Address"
                    placeholder="House / flat, street"
                    required
                  />
                  <Input
                    name="line2"
                    control={control}
                    label="Landmark (optional)"
                    placeholder="Near city mall"
                  />

                  <Row gutter={16}>
                    <Col xs={24} sm={8}>
                      <Input
                        name="city"
                        control={control}
                        label="City"
                        placeholder="Indore"
                        required
                      />
                    </Col>
                    <Col xs={24} sm={8}>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
                          <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>State
                        </label>
                        <Controller
                          name="state"
                          control={control}
                          render={({ field, fieldState: { error: fieldError } }) => (
                            <>
                              <Select
                                {...field}
                                value={field.value || undefined}
                                size="large"
                                style={{ width: "100%" }}
                                placeholder="Select a state"
                                showSearch
                                optionFilterProp="label"
                                options={INDIAN_STATES.map((state) => ({
                                  value: state,
                                  label: state,
                                }))}
                                status={fieldError ? "error" : ""}
                              />
                              {fieldError?.message && (
                                <div style={{ marginTop: 4, fontSize: 12, color: "#ff4d4f" }}>
                                  {fieldError.message}
                                </div>
                              )}
                            </>
                          )}
                        />
                      </div>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Input
                        name="postalCode"
                        control={control}
                        label="PIN code"
                        placeholder="452001"
                        required
                      />
                    </Col>
                  </Row>

                  <Input name="country" control={control} label="Country" required />

                  <Button block onClick={handleSubmit(handleAddressSubmit)}>
                    Continue to review
                  </Button>
                </Card>
              )}

              {step === 1 && address && (
                <>
                  <Card
                    title={
                      <Space>
                        <EnvironmentOutlined />
                        <span>Deliver to</span>
                      </Space>
                    }
                    extra={
                      <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => setStep(0)}
                      >
                        Change
                      </Button>
                    }
                    styles={{ body: { padding: 16 } }}
                  >
                    <AddressSummary address={address} />
                  </Card>

                  <Card
                    style={{ marginTop: 16 }}
                    title="Payment method"
                    styles={{ body: { padding: 16 } }}
                  >
                    <Radio.Group
                      value={payment}
                      onChange={(e) => setPayment(e.target.value)}
                      style={{ width: "100%" }}
                    >
                      <Space direction="vertical" size={12} style={{ width: "100%" }}>
                        {PAYMENT_OPTIONS.map((option) => {
                          const unavailable = option.value === "razorpay" && !onlineEnabled;
                          return (
                            <Radio
                              key={option.value}
                              value={option.value}
                              disabled={unavailable}
                              style={{
                                display: "block",
                                padding: 12,
                                border: "1px solid #f0f0f0",
                                borderRadius: 8,
                                width: "100%",
                              }}
                            >
                              <Space size={8}>
                                <Text strong>{option.label}</Text>
                                {unavailable && <Tag>Unavailable</Tag>}
                              </Space>
                              <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                                {unavailable
                                  ? "Online payments are not configured on this server"
                                  : option.description}
                              </div>
                            </Radio>
                          );
                        })}
                      </Space>
                    </Radio.Group>
                  </Card>

                  <Card
                    style={{ marginTop: 16 }}
                    title={`Your order (${pricing.groups.length} shipment${
                      pricing.groups.length > 1 ? "s" : ""
                    })`}
                    styles={{ body: { padding: 0 } }}
                  >
                    {pricing.groups.map((group, index) => (
                      <div key={group.sellerId}>
                        <div style={{ padding: 16 }}>
                          <Space size={6} style={{ marginBottom: 12 }}>
                            <ShopOutlined style={{ color: "#722ed1" }} />
                            <Text strong>{group.sellerName || `Seller #${group.sellerId}`}</Text>
                          </Space>

                          {group.items.map((item) => (
                            <Row
                              key={item.productId}
                              justify="space-between"
                              gutter={[8, 8]}
                              style={{ marginBottom: 6 }}
                            >
                              <Col flex="auto" style={{ minWidth: 0 }}>
                                <Text ellipsis style={{ display: "block" }}>
                                  {item.name}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Qty {item.quantity} × {formatPrice(item.price, "INR")}
                                </Text>
                              </Col>
                              <Col>
                                <Text>{formatPrice(item.lineTotal, "INR")}</Text>
                              </Col>
                            </Row>
                          ))}

                          <Divider style={{ margin: "12px 0" }} />
                          <Row justify="space-between">
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Shipment total (incl. delivery and tax)
                            </Text>
                            <Text strong>{formatPrice(group.total, "INR")}</Text>
                          </Row>
                        </div>
                        {index < pricing.groups.length - 1 && <Divider style={{ margin: 0 }} />}
                      </div>
                    ))}
                  </Card>
                </>
              )}
            </Col>

            <Col xs={24} lg={9}>
              <Affix offsetTop={24}>
                <Card title="Order summary" styles={{ body: { padding: 16 } }}>
                  <Space direction="vertical" size={10} style={{ width: "100%" }}>
                    <Row justify="space-between">
                      <Text type="secondary">
                        Price ({formatCount(pricing.totalQuantity)} item
                        {pricing.totalQuantity > 1 ? "s" : ""})
                      </Text>
                      <Text>{formatPrice(pricing.mrpTotal, "INR")}</Text>
                    </Row>
                    {pricing.productDiscount > 0 && (
                      <Row justify="space-between">
                        <Text type="secondary">Discount</Text>
                        <Text style={{ color: "#52c41a" }}>
                          − {formatPrice(pricing.productDiscount, "INR")}
                        </Text>
                      </Row>
                    )}
                    <Row justify="space-between">
                      <Text type="secondary">Delivery</Text>
                      <Text style={pricing.shippingCost === 0 ? { color: "#52c41a" } : undefined}>
                        {pricing.shippingCost === 0
                          ? "FREE"
                          : formatPrice(pricing.shippingCost, "INR")}
                      </Text>
                    </Row>
                    <Row justify="space-between">
                      <Text type="secondary">Tax ({Math.round(TAX_RATE * 100)}%)</Text>
                      <Text>{formatPrice(pricing.tax, "INR")}</Text>
                    </Row>
                    <Divider style={{ margin: "4px 0" }} />
                    <Row justify="space-between" align="middle">
                      <Title level={5} style={{ margin: 0 }}>
                        Total
                      </Title>
                      <Title level={4} style={{ margin: 0 }}>
                        {formatPrice(pricing.total, "INR")}
                      </Title>
                    </Row>
                    {pricing.groups.length > 1 && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Delivery and tax are charged per shipment.
                      </Text>
                    )}
                  </Space>

                  {step === 1 && (
                    <Button
                      block
                      style={{ marginTop: 16 }}
                      loading={paying}
                      onClick={handlePlaceOrder}
                    >
                      {payment === "razorpay" && onlineEnabled
                        ? `Pay ${formatPrice(pricing.total, "INR")}`
                        : "Place order"}
                    </Button>
                  )}

                  <Paragraph
                    type="secondary"
                    style={{ fontSize: 12, margin: "12px 0 0", display: "flex", gap: 6 }}
                  >
                    <LockOutlined />
                    <span>Your address is only shared with the sellers in this order.</span>
                  </Paragraph>
                </Card>
              </Affix>
            </Col>
          </Row>
        </>
      )}
    </AppLayout>
  );
}
