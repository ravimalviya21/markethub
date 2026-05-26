import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  App,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Image,
  Input as AntInput,
  Layout,
  Modal,
  Row,
  Segmented,
  Space,
  Steps,
  Tag,
  Typography,
} from "antd";
import {
  CalendarOutlined,
  CarryOutOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  HeartOutlined,
  HomeOutlined,
  LogoutOutlined,
  RollbackOutlined,
  SearchOutlined,
  ShoppingOutlined,
  TruckOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import Header from "@/components/layout/Header";
import { Button } from "@/components/ui";
import { BUYER_ORDERS, USER_PROFILE } from "@/utils/dummy";

const { Content } = Layout;
const { Title, Text } = Typography;

const STATUS_META = {
  pending: { label: "Pending", color: "gold", icon: <ClockCircleOutlined /> },
  confirmed: { label: "Confirmed", color: "blue", icon: <CarryOutOutlined /> },
  shipped: { label: "Shipped", color: "geekblue", icon: <TruckOutlined /> },
  delivered: { label: "Delivered", color: "green", icon: <CheckCircleOutlined /> },
  cancelled: { label: "Cancelled", color: "red", icon: <CloseCircleOutlined /> },
  returned: { label: "Returned", color: "purple", icon: <RollbackOutlined /> },
};

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "returned", label: "Returned" },
];

const formatPrice = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const StatusTag = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <Tag color={meta.color} icon={meta.icon} style={{ margin: 0 }}>
      {meta.label}
    </Tag>
  );
};

const OrderCard = ({ order, onView, onTrack, onCancel, onReturn, onBuyAgain, onRate }) => {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const previewItems = order.items.slice(0, 3);
  const extra = order.items.length - previewItems.length;

  return (
    <Card
      hoverable
      onClick={() => onView?.(order)}
      style={{ cursor: "pointer" }}
      styles={{ body: { padding: 20 } }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Space size={12} wrap>
          <Text strong>{order.id}</Text>
          <StatusTag status={order.status} />
        </Space>
        <Space size={8} wrap>
          <CalendarOutlined style={{ color: "#8c8c8c" }} />
          <Text type="secondary" style={{ fontSize: 13 }}>
            Placed on {dayjs(order.placedAt).format("DD MMM YYYY")}
          </Text>
        </Space>
      </div>

      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={14}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {previewItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  flex: "1 1 220px",
                  minWidth: 0,
                }}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  width={64}
                  height={64}
                  preview={false}
                  style={{ borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                />
                <div style={{ minWidth: 0 }}>
                  <Text ellipsis style={{ display: "block", fontWeight: 500 }}>
                    {item.title}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Qty {item.quantity} &middot; {formatPrice(item.price)}
                  </Text>
                </div>
              </div>
            ))}
            {extra > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 64,
                  height: 64,
                  borderRadius: 8,
                  background: "#f0f2f5",
                  color: "#595959",
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              >
                +{extra}
              </div>
            )}
          </div>
        </Col>

        <Col xs={24} md={10}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 4,
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              {itemCount} item{itemCount > 1 ? "s" : ""} &middot; {order.paymentMethod}
            </Text>
            <Title level={4} style={{ margin: 0 }}>
              {formatPrice(order.total)}
            </Title>
            {order.status === "shipped" && order.expectedBy && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Arriving by {dayjs(order.expectedBy).format("DD MMM")}
              </Text>
            )}
            {order.status === "delivered" && order.deliveredAt && (
              <Text type="success" style={{ fontSize: 12 }}>
                Delivered {dayjs(order.deliveredAt).format("DD MMM YYYY")}
              </Text>
            )}
          </div>
        </Col>
      </Row>

      <Divider style={{ margin: "16px 0" }} />

      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
        onClick={(e) => e.stopPropagation()}
      >
        <Button type="default" onClick={() => onView?.(order)}>
          View details
        </Button>
        {order.status === "shipped" && (
          <Button type="default" icon={<TruckOutlined />} onClick={() => onTrack?.(order)}>
            Track order
          </Button>
        )}
        {(order.status === "pending" || order.status === "confirmed") && (
          <Button type="default" danger onClick={() => onCancel?.(order)}>
            Cancel order
          </Button>
        )}
        {order.status === "delivered" && (
          <>
            <Button type="default" onClick={() => onReturn?.(order)}>
              Return / Replace
            </Button>
            <Button onClick={() => onRate?.(order)}>Rate &amp; review</Button>
          </>
        )}
        {(order.status === "delivered" ||
          order.status === "cancelled" ||
          order.status === "returned") && (
          <Button type="default" onClick={() => onBuyAgain?.(order)}>
            Buy again
          </Button>
        )}
      </div>
    </Card>
  );
};

const ORDER_STEPS = ["pending", "confirmed", "shipped", "delivered"];

const OrderTimeline = ({ order }) => {
  if (order.status === "cancelled") {
    return (
      <Steps
        size="small"
        current={1}
        status="error"
        items={[
          { title: "Order placed", description: dayjs(order.placedAt).format("DD MMM YYYY") },
          {
            title: "Cancelled",
            description: order.cancelledAt
              ? dayjs(order.cancelledAt).format("DD MMM YYYY")
              : undefined,
          },
        ]}
      />
    );
  }
  if (order.status === "returned") {
    return (
      <Steps
        size="small"
        current={2}
        items={[
          { title: "Placed", description: dayjs(order.placedAt).format("DD MMM") },
          { title: "Delivered" },
          {
            title: "Returned",
            description: order.returnedAt
              ? dayjs(order.returnedAt).format("DD MMM")
              : undefined,
          },
        ]}
      />
    );
  }
  const current = Math.max(ORDER_STEPS.indexOf(order.status), 0);
  return (
    <Steps
      size="small"
      current={current}
      items={[
        { title: "Placed", description: dayjs(order.placedAt).format("DD MMM") },
        { title: "Confirmed" },
        {
          title: "Shipped",
          description: order.trackingId ? `#${order.trackingId}` : undefined,
        },
        {
          title: "Delivered",
          description: order.deliveredAt
            ? dayjs(order.deliveredAt).format("DD MMM")
            : order.expectedBy
              ? `By ${dayjs(order.expectedBy).format("DD MMM")}`
              : undefined,
        },
      ]}
    />
  );
};

const OrderDetailModal = ({ open, order, address, onCancel }) => {
  if (!order) return null;
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={
        <Space size={12}>
          <span>Order {order.id}</span>
          <StatusTag status={order.status} />
        </Space>
      }
      footer={null}
      centered
      width={760}
      destroyOnHidden
    >
      <div style={{ marginTop: 8 }}>
        <OrderTimeline order={order} />
      </div>

      <Divider />

      <Title level={5} style={{ marginTop: 0 }}>Items</Title>
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        {order.items.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              padding: 12,
              border: "1px solid #f0f0f0",
              borderRadius: 8,
            }}
          >
            <Image
              src={item.image}
              alt={item.title}
              width={64}
              height={64}
              preview={false}
              style={{ borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text strong>{item.title}</Text>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Sold by {item.seller}
                </Text>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Qty {item.quantity}
              </Text>
            </div>
            <Text strong>{formatPrice(item.price * item.quantity)}</Text>
          </div>
        ))}
      </Space>

      <Divider />

      <Row gutter={[24, 16]}>
        <Col xs={24} md={12}>
          <Title level={5} style={{ marginTop: 0 }}>Shipping address</Title>
          {address ? (
            <div style={{ fontSize: 13, lineHeight: 1.7 }}>
              <Space size={6}>
                {address.label === "Home" ? <HomeOutlined /> : <EnvironmentOutlined />}
                <Text strong>{address.label}</Text>
              </Space>
              <div>{address.name} &middot; {address.phone}</div>
              <div>{address.line1}</div>
              {address.line2 && <div>{address.line2}</div>}
              <div>{address.city}, {address.state} {address.pincode}</div>
              <div>{address.country}</div>
            </div>
          ) : (
            <Text type="secondary">Address not available</Text>
          )}
        </Col>
        <Col xs={24} md={12}>
          <Title level={5} style={{ marginTop: 0 }}>Payment summary</Title>
          <Descriptions
            column={1}
            size="small"
            colon={false}
            items={[
              { key: "method", label: "Method", children: order.paymentMethod },
              { key: "subtotal", label: "Subtotal", children: formatPrice(order.subtotal) },
              {
                key: "shipping",
                label: "Shipping",
                children: order.shipping ? formatPrice(order.shipping) : "Free",
              },
              {
                key: "total",
                label: <Text strong>Total</Text>,
                children: <Text strong>{formatPrice(order.total)}</Text>,
              },
            ]}
          />
        </Col>
      </Row>
    </Modal>
  );
};

export default function BuyerOrdersPage() {
  const router = useRouter();
  const { modal, message } = App.useApp();
  const [orders, setOrders] = useState(BUYER_ORDERS);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const user = USER_PROFILE;
  const defaultAddress =
    user.addresses.find((a) => a.isDefault) || user.addresses[0];

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

  const counts = useMemo(() => {
    const acc = { all: orders.length };
    for (const o of orders) acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, [orders]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!term) return true;
      if (o.id.toLowerCase().includes(term)) return true;
      return o.items.some((i) => i.title.toLowerCase().includes(term));
    });
  }, [orders, filter, search]);

  const handleView = (order) => setSelected(order);
  const handleCloseModal = () => setSelected(null);

  const handleTrack = (order) => {
    message.info(`Tracking ${order.trackingId || order.id}`);
  };

  const handleCancel = (order) => {
    modal.confirm({
      title: `Cancel order ${order.id}?`,
      content: "This action can't be undone. Refunds may take 5–7 business days.",
      okText: "Cancel order",
      okButtonProps: { danger: true },
      cancelText: "Keep order",
      onOk: () => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? {
                  ...o,
                  status: "cancelled",
                  cancelledAt: new Date().toISOString(),
                }
              : o
          )
        );
        message.success("Order cancelled");
      },
    });
  };

  const handleReturn = (order) => {
    message.info(`Return request started for ${order.id}`);
  };

  const handleBuyAgain = (order) => {
    message.success(`${order.items.length} item${order.items.length > 1 ? "s" : ""} added to cart`);
  };

  const handleRate = (order) => {
    message.info(`Rate items in ${order.id}`);
  };

  const filterOptionsWithCount = FILTER_OPTIONS.map((opt) => ({
    ...opt,
    label: (
      <span>
        {opt.label}
        <span style={{ marginLeft: 6, color: "#8c8c8c" }}>
          {counts[opt.value] || 0}
        </span>
      </span>
    ),
  }));

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fb" }}>
      <Header
        user={{ name: `${user.firstName} ${user.lastName}` }}
        profileMenuItems={profileMenuItems}
        cartCount={0}
        onCartClick={() => router.push("/buyer/cart")}
        onSearch={(term) => console.log("search:", term)}
        onChangeLocation={(loc) => console.log("location:", loc)}
      />
      <Content>
        <div
          style={{
            padding: 24,
            maxWidth: 1100,
            width: "100%",
            margin: "0 auto",
          }}
        >
          <Title level={3} style={{ marginTop: 8 }}>My Orders</Title>
          <Text type="secondary">
            Track, manage and re-order from your purchase history.
          </Text>

          <Card style={{ marginTop: 24 }} styles={{ body: { padding: 16 } }}>
            <Row gutter={[16, 16]} align="middle" justify="space-between">
              <Col xs={24} md={16}>
                <Segmented
                  value={filter}
                  onChange={setFilter}
                  options={filterOptionsWithCount}
                  size="large"
                  style={{ maxWidth: "100%", overflowX: "auto" }}
                />
              </Col>
              <Col xs={24} md={8}>
                <AntInput
                  size="large"
                  allowClear
                  prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
                  placeholder="Search by order ID or item"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Col>
            </Row>
          </Card>

          <div style={{ marginTop: 24 }}>
            {filtered.length === 0 ? (
              <Card>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    search
                      ? "No orders match your search"
                      : "You don't have any orders here yet"
                  }
                >
                  <Button onClick={() => router.push("/buyer/dashboard")}>
                    Continue shopping
                  </Button>
                </Empty>
              </Card>
            ) : (
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                {filtered.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onView={handleView}
                    onTrack={handleTrack}
                    onCancel={handleCancel}
                    onReturn={handleReturn}
                    onBuyAgain={handleBuyAgain}
                    onRate={handleRate}
                  />
                ))}
              </Space>
            )}
          </div>
        </div>
      </Content>

      <OrderDetailModal
        open={Boolean(selected)}
        order={selected}
        address={defaultAddress}
        onCancel={handleCloseModal}
      />
    </Layout>
  );
}
