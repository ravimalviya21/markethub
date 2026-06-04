import { useMemo, useState } from "react";
import {
  App,
  Avatar,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Dropdown,
  Empty,
  Input,
  List,
  Row,
  Segmented,
  Select,
  Space,
  Statistic,
  Steps,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  SearchOutlined,
  ShoppingOutlined,
  EyeOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  ShopOutlined,
  UserOutlined,
  MoreOutlined,
  ReloadOutlined,
  ExportOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CarOutlined,
  RollbackOutlined,
  CreditCardOutlined,
  EnvironmentOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui";
import { ADMIN_ORDERS } from "@/utils/dummy";
import { formatPrice } from "@/utils/customMethods";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const STATUS_META = {
  pending: { label: "Pending", color: "default", icon: <ClockCircleOutlined /> },
  confirmed: { label: "Confirmed", color: "blue", icon: <CheckCircleOutlined /> },
  processing: { label: "Processing", color: "cyan", icon: <SyncOutlined spin /> },
  shipped: { label: "Shipped", color: "geekblue", icon: <CarOutlined /> },
  delivered: { label: "Delivered", color: "green", icon: <CheckCircleOutlined /> },
  cancelled: { label: "Cancelled", color: "red", icon: <CloseCircleOutlined /> },
  returned: { label: "Returned", color: "orange", icon: <RollbackOutlined /> },
};

const PAYMENT_STATUS_META = {
  paid: { label: "Paid", color: "green" },
  pending: { label: "Pending", color: "gold" },
  refunded: { label: "Refunded", color: "purple" },
};

const PAYMENT_METHOD_META = {
  upi: { label: "UPI" },
  card: { label: "Card" },
  cod: { label: "Cash on Delivery" },
  wallet: { label: "Wallet" },
};

const STATUS_FLOW = ["pending", "confirmed", "processing", "shipped", "delivered"];

const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

const StatusTag = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <Tag color={meta.color} icon={meta.icon} style={{ margin: 0 }}>
      {meta.label}
    </Tag>
  );
};

const PaymentStatusTag = ({ status }) => {
  const meta = PAYMENT_STATUS_META[status] || PAYMENT_STATUS_META.pending;
  return (
    <Tag color={meta.color} style={{ margin: 0 }}>
      {meta.label}
    </Tag>
  );
};

const StatCard = ({ icon, iconBg, title, value, formatter, suffix }) => (
  <Card styles={{ body: { padding: 18 } }} style={{ height: "100%" }}>
    <Space align="start" size={14} style={{ width: "100%" }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: iconBg,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {title}
        </Text>
        <Statistic
          value={value}
          formatter={formatter || ((v) => formatNumber(v))}
          suffix={suffix}
          valueStyle={{ fontSize: 22, fontWeight: 600, lineHeight: 1.2 }}
        />
      </div>
    </Space>
  </Card>
);

const getStepperState = (status) => {
  if (status === "cancelled" || status === "returned") return null;
  const idx = STATUS_FLOW.indexOf(status);
  return idx >= 0 ? idx : 0;
};

const OrderDrawer = ({ open, order, onClose, onAdvance, onCancel }) => {
  if (!order) return null;
  const stepIdx = getStepperState(order.status);
  const isTerminal =
    order.status === "delivered" ||
    order.status === "cancelled" ||
    order.status === "returned";
  const paymentMeta = PAYMENT_METHOD_META[order.paymentMethod] || { label: order.paymentMethod };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={Math.min(520, typeof window !== "undefined" ? window.innerWidth : 520)}
      title={`Order ${order.id}`}
      destroyOnHidden
    >
      <Space size={8} wrap style={{ marginBottom: 16 }}>
        <StatusTag status={order.status} />
        <PaymentStatusTag status={order.paymentStatus} />
        <Tag style={{ margin: 0 }}>{paymentMeta.label}</Tag>
      </Space>

      {stepIdx !== null && (
        <Steps
          size="small"
          current={stepIdx}
          style={{ marginBottom: 24 }}
          items={[
            { title: "Pending" },
            { title: "Confirmed" },
            { title: "Processing" },
            { title: "Shipped" },
            { title: "Delivered" },
          ]}
        />
      )}

      <Descriptions column={1} size="small" colon={false} bordered>
        <Descriptions.Item label={<Space size={6}><UserOutlined />Buyer</Space>}>
          <div>{order.buyerName}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {order.buyerEmail}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label={<Space size={6}><ShopOutlined />Seller</Space>}>
          {order.sellerName}
        </Descriptions.Item>
        <Descriptions.Item label={<Space size={6}><EnvironmentOutlined />Ship to</Space>}>
          {order.shippingCity}
        </Descriptions.Item>
        <Descriptions.Item label={<Space size={6}><ClockCircleOutlined />Placed</Space>}>
          {dayjs(order.placedAt).format("DD MMM YYYY, HH:mm")}
        </Descriptions.Item>
        <Descriptions.Item label={<Space size={6}><CreditCardOutlined />Payment</Space>}>
          {paymentMeta.label} · <PaymentStatusTag status={order.paymentStatus} />
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left" style={{ marginTop: 24, fontSize: 14 }}>
        Items ({order.items.length})
      </Divider>

      <List
        size="small"
        dataSource={order.items}
        renderItem={(item) => (
          <List.Item style={{ padding: "8px 0" }}>
            <List.Item.Meta
              title={<Text>{item.name}</Text>}
              description={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Qty {item.qty} × {formatPrice(item.price, "INR")}
                </Text>
              }
            />
            <Text strong>{formatPrice(item.qty * item.price, "INR")}</Text>
          </List.Item>
        )}
      />

      <div
        style={{
          marginTop: 16,
          padding: 16,
          background: "#fafafa",
          borderRadius: 8,
        }}
      >
        <Row justify="space-between" style={{ marginBottom: 6 }}>
          <Text type="secondary">Subtotal</Text>
          <Text>{formatPrice(order.subtotal, "INR")}</Text>
        </Row>
        <Row justify="space-between" style={{ marginBottom: 6 }}>
          <Text type="secondary">Shipping</Text>
          <Text>
            {order.shipping === 0 ? "Free" : formatPrice(order.shipping, "INR")}
          </Text>
        </Row>
        <Row justify="space-between" style={{ marginBottom: 8 }}>
          <Text type="secondary">Tax</Text>
          <Text>{formatPrice(order.tax, "INR")}</Text>
        </Row>
        <Divider style={{ margin: "8px 0" }} />
        <Row justify="space-between">
          <Text strong>Total</Text>
          <Text strong style={{ fontSize: 16 }}>
            {formatPrice(order.total, "INR")}
          </Text>
        </Row>
      </div>

      <Space style={{ width: "100%", marginTop: 24 }} direction="vertical">
        {!isTerminal && (
          <Button
            type="primary"
            block
            icon={<SyncOutlined />}
            onClick={() => onAdvance(order)}
          >
            Advance to{" "}
            {STATUS_META[STATUS_FLOW[Math.min(stepIdx + 1, STATUS_FLOW.length - 1)]]?.label}
          </Button>
        )}
        <Button
          block
          icon={<PrinterOutlined />}
          onClick={() => window?.print?.()}
        >
          Print invoice
        </Button>
        {!isTerminal && (
          <Button
            danger
            block
            icon={<CloseCircleOutlined />}
            onClick={() => onCancel(order)}
          >
            Cancel order
          </Button>
        )}
      </Space>
    </Drawer>
  );
};

export default function AdminOrderManagementPage() {
  const { modal, message } = App.useApp();
  const [orders, setOrders] = useState(ADMIN_ORDERS);
  const [status, setStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [selected, setSelected] = useState(null);

  const stats = useMemo(() => {
    const acc = {
      total: orders.length,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
      revenue: 0,
      pendingPayment: 0,
    };
    for (const o of orders) {
      acc[o.status] = (acc[o.status] || 0) + 1;
      if (o.paymentStatus === "paid") acc.revenue += Number(o.total || 0);
      if (o.paymentStatus === "pending") acc.pendingPayment += 1;
    }
    return acc;
  }, [orders]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const [start, end] = dateRange || [];
    return orders.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (paymentStatus !== "all" && o.paymentStatus !== paymentStatus) return false;
      if (paymentMethod !== "all" && o.paymentMethod !== paymentMethod) return false;
      if (
        term &&
        !o.id.toLowerCase().includes(term) &&
        !o.buyerName.toLowerCase().includes(term) &&
        !o.buyerEmail.toLowerCase().includes(term) &&
        !o.sellerName.toLowerCase().includes(term)
      )
        return false;
      if (start && dayjs(o.placedAt).isBefore(start, "day")) return false;
      if (end && dayjs(o.placedAt).isAfter(end, "day")) return false;
      return true;
    });
  }, [orders, status, paymentStatus, paymentMethod, search, dateRange]);

  const applyStatus = (order, nextStatus, paymentPatch) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? { ...o, status: nextStatus, ...(paymentPatch || {}) }
          : o
      )
    );
    setSelected((prev) =>
      prev && prev.id === order.id
        ? { ...prev, status: nextStatus, ...(paymentPatch || {}) }
        : prev
    );
  };

  const handleAdvance = (order) => {
    const stepIdx = getStepperState(order.status);
    if (stepIdx === null) return;
    const next = STATUS_FLOW[Math.min(stepIdx + 1, STATUS_FLOW.length - 1)];
    if (next === order.status) return;
    applyStatus(order, next);
    message.success(`${order.id} → ${STATUS_META[next].label}`);
  };

  const handleCancel = (order) => {
    modal.confirm({
      title: `Cancel ${order.id}?`,
      content:
        "The order will be cancelled. If payment was captured, mark it for refund manually.",
      okText: "Cancel order",
      okButtonProps: { danger: true },
      cancelText: "Back",
      onOk: () => {
        const patch =
          order.paymentStatus === "paid" ? { paymentStatus: "refunded" } : null;
        applyStatus(order, "cancelled", patch);
        message.success(`${order.id} cancelled`);
      },
    });
  };

  const handleResetFilters = () => {
    setStatus("all");
    setPaymentStatus("all");
    setPaymentMethod("all");
    setSearch("");
    setDateRange(null);
  };

  const statusOptions = [
    { value: "all", label: `All (${stats.total})` },
    { value: "pending", label: `Pending (${stats.pending || 0})` },
    { value: "confirmed", label: `Confirmed (${stats.confirmed || 0})` },
    { value: "processing", label: `Processing (${stats.processing || 0})` },
    { value: "shipped", label: `Shipped (${stats.shipped || 0})` },
    { value: "delivered", label: `Delivered (${stats.delivered || 0})` },
    { value: "cancelled", label: `Cancelled (${stats.cancelled || 0})` },
    { value: "returned", label: `Returned (${stats.returned || 0})` },
  ];

  const columns = [
    {
      title: "Order",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id.localeCompare(b.id),
      render: (id, order) => (
        <Space size={12}>
          <Avatar icon={<ShoppingOutlined />} style={{ background: "#1677ff" }} />
          <div style={{ minWidth: 0 }}>
            <a onClick={() => setSelected(order)} style={{ fontWeight: 500 }}>
              {id}
            </a>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {order.items.length} item{order.items.length === 1 ? "" : "s"} ·{" "}
                {order.shippingCity}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Buyer",
      dataIndex: "buyerName",
      key: "buyerName",
      width: 200,
      render: (name, order) => (
        <div>
          <Text>{name}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {order.buyerEmail}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Seller",
      dataIndex: "sellerName",
      key: "sellerName",
      width: 180,
      render: (s) => (
        <Space size={6}>
          <ShopOutlined style={{ color: "#722ed1" }} />
          <Text>{s}</Text>
        </Space>
      ),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      width: 120,
      sorter: (a, b) => a.total - b.total,
      render: (v) => <Text strong>{formatPrice(v, "INR")}</Text>,
    },
    {
      title: "Payment",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 140,
      render: (ps, order) => (
        <Space size={6} direction="vertical" align="start">
          <PaymentStatusTag status={ps} />
          <Text type="secondary" style={{ fontSize: 11 }}>
            {(PAYMENT_METHOD_META[order.paymentMethod] || { label: order.paymentMethod }).label}
          </Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (s) => <StatusTag status={s} />,
    },
    {
      title: "Placed",
      dataIndex: "placedAt",
      key: "placedAt",
      width: 140,
      sorter: (a, b) => dayjs(a.placedAt).valueOf() - dayjs(b.placedAt).valueOf(),
      defaultSortOrder: "descend",
      render: (placedAt) => (
        <Tooltip title={dayjs(placedAt).format("DD MMM YYYY, HH:mm")}>
          <Text>{dayjs(placedAt).format("DD MMM YYYY")}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      fixed: "right",
      render: (_, order) => {
        const stepIdx = getStepperState(order.status);
        const canAdvance = stepIdx !== null && stepIdx < STATUS_FLOW.length - 1;
        const isTerminal =
          order.status === "delivered" ||
          order.status === "cancelled" ||
          order.status === "returned";
        const menuItems = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "View details",
            onClick: () => setSelected(order),
          },
          { type: "divider" },
          ...(canAdvance
            ? [
                {
                  key: "advance",
                  icon: <SyncOutlined />,
                  label: `Move to ${STATUS_META[STATUS_FLOW[stepIdx + 1]].label}`,
                  onClick: () => handleAdvance(order),
                },
              ]
            : []),
          ...(!isTerminal
            ? [
                {
                  key: "cancel",
                  icon: <CloseCircleOutlined />,
                  label: "Cancel order",
                  danger: true,
                  onClick: () => handleCancel(order),
                },
              ]
            : []),
        ];
        return (
          <Space>
            <Button
              type="default"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setSelected(order)}
            >
              View
            </Button>
            <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
              <Button type="default" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const activeCount =
    (stats.pending || 0) +
    (stats.confirmed || 0) +
    (stats.processing || 0) +
    (stats.shipped || 0);

  return (
    <AdminLayout maxWidth={1440}>
      <Row align="middle" justify="space-between" gutter={[16, 16]}>
        <Col>
          <Title level={3} style={{ marginTop: 8, marginBottom: 0 }}>
            Order Management
          </Title>
          <Text type="secondary">
            Track every order across its lifecycle and resolve issues quickly.
          </Text>
        </Col>
        <Col>
          <Space>
            <Tooltip title="Export to CSV">
              <Button
                type="default"
                icon={<ExportOutlined />}
                onClick={() => message.info("Export coming soon")}
              >
                Export
              </Button>
            </Tooltip>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<ShoppingOutlined />}
            iconBg="#1677ff"
            title="Total orders"
            value={stats.total}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<SyncOutlined spin />}
            iconBg="#13c2c2"
            title="In progress"
            value={activeCount}
            suffix={
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 6 }}>
                / {stats.delivered || 0} delivered
              </Text>
            }
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<ClockCircleOutlined />}
            iconBg="#fa8c16"
            title="Pending payment"
            value={stats.pendingPayment}
            suffix={
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 6 }}>
                · {stats.cancelled || 0} cancelled
              </Text>
            }
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<DollarOutlined />}
            iconBg="#52c41a"
            title="Captured revenue"
            value={stats.revenue}
            formatter={(v) => formatPrice(v, "INR")}
          />
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }} styles={{ body: { padding: 16 } }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24}>
            <Segmented
              value={status}
              onChange={setStatus}
              options={statusOptions}
              size="large"
              style={{ maxWidth: "100%", overflowX: "auto" }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              size="large"
              value={paymentStatus}
              onChange={setPaymentStatus}
              style={{ width: "100%" }}
              options={[
                { value: "all", label: "All payments" },
                { value: "paid", label: "Paid" },
                { value: "pending", label: "Pending" },
                { value: "refunded", label: "Refunded" },
              ]}
              suffixIcon={<CreditCardOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              size="large"
              value={paymentMethod}
              onChange={setPaymentMethod}
              style={{ width: "100%" }}
              options={[
                { value: "all", label: "All methods" },
                { value: "upi", label: "UPI" },
                { value: "card", label: "Card" },
                { value: "cod", label: "Cash on Delivery" },
                { value: "wallet", label: "Wallet" },
              ]}
            />
          </Col>
          <Col xs={24} lg={12}>
            <RangePicker
              size="large"
              style={{ width: "100%" }}
              value={dateRange}
              onChange={setDateRange}
              allowClear
              placeholder={["Placed from", "Placed to"]}
            />
          </Col>
          <Col xs={24} md={18}>
            <Input
              size="large"
              allowClear
              prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
              placeholder="Search by order ID, buyer, email or seller"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
          <Col xs={24} md={6}>
            <Button
              size="large"
              block
              icon={<ReloadOutlined />}
              onClick={handleResetFilters}
            >
              Reset filters
            </Button>
          </Col>
        </Row>
      </Card>

      <Card
        style={{ marginTop: 16 }}
        styles={{ body: { padding: 0 } }}
        title={
          <Space>
            <Text strong>Orders</Text>
            <Tag color="blue" style={{ margin: 0 }}>
              {formatNumber(filtered.length)} shown
            </Tag>
          </Space>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
            showTotal: (total) => `${formatNumber(total)} orders`,
          }}
          scroll={{ x: 1300 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No orders match these filters"
              />
            ),
          }}
        />
      </Card>

      <OrderDrawer
        open={Boolean(selected)}
        order={selected}
        onClose={() => setSelected(null)}
        onAdvance={handleAdvance}
        onCancel={handleCancel}
      />
    </AdminLayout>
  );
}
