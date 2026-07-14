import { useMemo, useState } from "react";
import {
  App,
  Avatar,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Drawer,
  Empty,
  Image,
  Input,
  Rate,
  Row,
  Segmented,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  SearchOutlined,
  AuditOutlined,
  ShopOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  TagOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui";
import { ADMIN_SELLERS, ADMIN_PRODUCTS } from "@/utils/dummy";
import { formatPrice } from "@/utils/customMethods";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const TYPE_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  seller: { label: "Seller registration", color: "purple", icon: <ShopOutlined /> },
  product: { label: "Product listing", color: "cyan", icon: <AppstoreOutlined /> },
};

const formatNumber = (value: number | undefined) => Number(value || 0).toLocaleString("en-IN");

const computeDiscount = (mrp: number, price: number) => {
  if (!mrp || !price || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
};

const TypeTag = ({ type }: { type: string }) => {
  const meta = TYPE_META[type] || TYPE_META.seller;
  return (
    <Tag color={meta.color} icon={meta.icon} style={{ margin: 0 }}>
      {meta.label}
    </Tag>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: React.ReactNode;
  formatter?: (value: any) => React.ReactNode;
  suffix?: React.ReactNode;
}

const StatCard = ({ icon, iconBg, title, value, formatter, suffix }: StatCardProps) => (
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
          value={value as any}
          formatter={formatter || ((v) => formatNumber(Number(v)))}
          suffix={suffix}
          valueStyle={{ fontSize: 22, fontWeight: 600, lineHeight: 1.2 }}
        />
      </div>
    </Space>
  </Card>
);

const SellerReview = ({ seller }: { seller: any }) => (
  <>
    <Space align="center" size={16} style={{ marginBottom: 16 }}>
      <Avatar size={64} src={seller.avatar} icon={<ShopOutlined />} />
      <div>
        <Title level={4} style={{ margin: 0 }}>
          {seller.businessName}
        </Title>
        <Text type="secondary">{seller.contactName}</Text>
      </div>
    </Space>
    <Descriptions column={1} size="small" colon={false} bordered>
      <Descriptions.Item label="Seller ID">{seller.id}</Descriptions.Item>
      <Descriptions.Item label="Category">{seller.category}</Descriptions.Item>
      <Descriptions.Item label={<Space size={6}><IdcardOutlined />GSTIN</Space>}>
        {seller.gstin || "—"}
      </Descriptions.Item>
      <Descriptions.Item label={<Space size={6}><MailOutlined />Email</Space>}>
        {seller.email}
      </Descriptions.Item>
      <Descriptions.Item label={<Space size={6}><PhoneOutlined />Phone</Space>}>
        {seller.phone}
      </Descriptions.Item>
      <Descriptions.Item label={<Space size={6}><EnvironmentOutlined />Location</Space>}>
        {seller.location}
      </Descriptions.Item>
      <Descriptions.Item label={<Space size={6}><ClockCircleOutlined />Applied</Space>}>
        {dayjs(seller.joinedAt).format("DD MMM YYYY")} ·{" "}
        {dayjs().diff(dayjs(seller.joinedAt), "day")} days ago
      </Descriptions.Item>
    </Descriptions>
  </>
);

const ProductReview = ({ product }: { product: any }) => {
  const discount = computeDiscount(product.mrp, product.price);
  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <Image
          src={product.image}
          alt={product.name}
          width={200}
          height={200}
          style={{ borderRadius: 12, objectFit: "cover" }}
          fallback="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
        />
      </div>
      <Title level={4} style={{ margin: 0 }}>
        {product.name}
      </Title>
      <Space size={8} wrap style={{ marginTop: 8, marginBottom: 16 }}>
        <Tag color="cyan" style={{ margin: 0 }}>
          {product.category}
        </Tag>
        {discount > 0 && (
          <Tag color="red" style={{ margin: 0 }}>
            {discount}% off
          </Tag>
        )}
      </Space>
      <Descriptions column={1} size="small" colon={false} bordered>
        <Descriptions.Item label="Product ID">{product.id}</Descriptions.Item>
        <Descriptions.Item label={<Space size={6}><ShopOutlined />Seller</Space>}>
          {product.sellerName}
        </Descriptions.Item>
        <Descriptions.Item label={<Space size={6}><TagOutlined />Price</Space>}>
          <Space size={8}>
            <Text strong>{formatPrice(product.price, "INR")}</Text>
            {product.mrp > product.price && (
              <Text delete type="secondary" style={{ fontSize: 12 }}>
                {formatPrice(product.mrp, "INR")}
              </Text>
            )}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label={<Space size={6}><InboxOutlined />Stock</Space>}>
          {formatNumber(product.stock)}
        </Descriptions.Item>
        <Descriptions.Item label="Seller rating">
          {product.rating ? (
            <Space size={6}>
              <Rate disabled allowHalf value={product.rating} style={{ fontSize: 14 }} />
              <Text type="secondary">{product.rating.toFixed(1)}</Text>
            </Space>
          ) : (
            "—"
          )}
        </Descriptions.Item>
        <Descriptions.Item label={<Space size={6}><ClockCircleOutlined />Submitted</Space>}>
          {dayjs(product.addedAt).format("DD MMM YYYY")} ·{" "}
          {dayjs().diff(dayjs(product.addedAt), "day")} days ago
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};

interface ApprovalDrawerProps {
  open: boolean;
  item: any;
  onClose: () => void;
  onApprove: (item: any) => void;
  onReject: (item: any) => void;
}

const ApprovalDrawer = ({ open, item, onClose, onApprove, onReject }: ApprovalDrawerProps) => {
  if (!item) return null;
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={Math.min(520, typeof window !== "undefined" ? window.innerWidth : 520)}
      title="Review request"
      destroyOnHidden
    >
      <Space size={8} wrap style={{ marginBottom: 16 }}>
        <TypeTag type={item.type} />
        <Tag color="gold" style={{ margin: 0 }}>
          Pending review
        </Tag>
      </Space>

      {item.type === "seller" ? (
        <SellerReview seller={item.data} />
      ) : (
        <ProductReview product={item.data} />
      )}

      <Space direction="vertical" style={{ width: "100%", marginTop: 24 }}>
        <Button
          type="primary"
          block
          icon={<CheckCircleOutlined />}
          onClick={() => onApprove(item)}
        >
          Approve
        </Button>
        <Button
          danger
          block
          icon={<CloseCircleOutlined />}
          onClick={() => onReject(item)}
        >
          Reject
        </Button>
      </Space>
    </Drawer>
  );
};

export default function AdminApprovalsPage() {
  const { modal, message } = App.useApp();
  const [sellers, setSellers] = useState<any[]>(ADMIN_SELLERS);
  const [products, setProducts] = useState<any[]>(ADMIN_PRODUCTS);
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);

  const items = useMemo(() => {
    const sellerItems = sellers
      .filter((s) => s.status === "pending")
      .map((s) => ({
        id: `S-${s.id}`,
        type: "seller",
        title: s.businessName,
        subtitle: s.contactName,
        category: s.category,
        submittedBy: s.contactName,
        submittedAt: s.joinedAt,
        avatar: s.avatar,
        image: s.avatar,
        data: s,
      }));
    const productItems = products
      .filter((p) => p.status === "pending")
      .map((p) => ({
        id: `P-${p.id}`,
        type: "product",
        title: p.name,
        subtitle: p.sellerName,
        category: p.category,
        submittedBy: p.sellerName,
        submittedAt: p.addedAt,
        avatar: p.image,
        image: p.image,
        data: p,
      }));
    return [...sellerItems, ...productItems].sort(
      (a, b) => dayjs(a.submittedAt).valueOf() - dayjs(b.submittedAt).valueOf()
    );
  }, [sellers, products]);

  const stats = useMemo(() => {
    const acc: Record<string, number> = { total: items.length, seller: 0, product: 0, oldestDays: 0 };
    for (const it of items) {
      acc[it.type] += 1;
      const days = dayjs().diff(dayjs(it.submittedAt), "day");
      if (days > acc.oldestDays) acc.oldestDays = days;
    }
    return acc;
  }, [items]);

  const categoryOptions = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean));
    return [
      { value: "all", label: "All categories" },
      ...Array.from(set).map((c) => ({ value: c, label: c })),
    ];
  }, [items]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const [start, end] = dateRange || [];
    return items.filter((i) => {
      if (type !== "all" && i.type !== type) return false;
      if (category !== "all" && i.category !== category) return false;
      if (
        term &&
        !i.title.toLowerCase().includes(term) &&
        !i.subtitle.toLowerCase().includes(term) &&
        !i.data.id.toLowerCase().includes(term)
      )
        return false;
      if (start && dayjs(i.submittedAt).isBefore(start, "day")) return false;
      if (end && dayjs(i.submittedAt).isAfter(end, "day")) return false;
      return true;
    });
  }, [items, type, category, search, dateRange]);

  const closeIfSelected = (id: string) => {
    setSelected((prev: any) => (prev && prev.id === id ? null : prev));
  };

  const applySellerStatus = (sellerId: string, nextStatus: string) => {
    setSellers((prev) =>
      prev.map((s) => (s.id === sellerId ? { ...s, status: nextStatus } : s))
    );
  };

  const applyProductStatus = (productId: string, nextStatus: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: nextStatus } : p))
    );
  };

  const handleApprove = (item: any) => {
    modal.confirm({
      title: `Approve ${item.title}?`,
      content:
        item.type === "seller"
          ? "The seller will be able to list products and receive orders."
          : "The product will be listed and become available to buyers.",
      okText: "Approve",
      cancelText: "Cancel",
      onOk: () => {
        if (item.type === "seller") applySellerStatus(item.data.id, "active");
        else applyProductStatus(item.data.id, "active");
        closeIfSelected(item.id);
        message.success(`${item.title} approved`);
      },
    });
  };

  const handleReject = (item: any) => {
    modal.confirm({
      title: `Reject ${item.title}?`,
      content:
        item.type === "seller"
          ? "The application will be marked as suspended. You can re-enable it later."
          : "The listing will be marked as rejected. The seller can be notified separately.",
      okText: "Reject",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: () => {
        if (item.type === "seller") applySellerStatus(item.data.id, "suspended");
        else applyProductStatus(item.data.id, "rejected");
        closeIfSelected(item.id);
        message.success(`${item.title} rejected`);
      },
    });
  };

  const handleResetFilters = () => {
    setType("all");
    setCategory("all");
    setSearch("");
    setDateRange(null);
  };

  const typeOptions = [
    { value: "all", label: `All (${stats.total})` },
    { value: "seller", label: `Sellers (${stats.seller})` },
    { value: "product", label: `Products (${stats.product})` },
  ];

  const columns = [
    {
      title: "Request",
      dataIndex: "title",
      key: "title",
      sorter: (a: any, b: any) => a.title.localeCompare(b.title),
      render: (_: any, item: any) => (
        <Space size={12}>
          <Avatar
            shape={item.type === "product" ? "square" : "circle"}
            size={44}
            src={item.image}
            icon={item.type === "product" ? <AppstoreOutlined /> : <ShopOutlined />}
          />
          <div style={{ minWidth: 0 }}>
            <a onClick={() => setSelected(item)} style={{ fontWeight: 500 }}>
              {item.title}
            </a>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {item.data.id} · {item.subtitle}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 200,
      render: (t: string) => <TypeTag type={t} />,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 160,
      render: (c: string) => <Tag style={{ margin: 0 }}>{c}</Tag>,
    },
    {
      title: "Submitted",
      dataIndex: "submittedAt",
      key: "submittedAt",
      width: 150,
      sorter: (a: any, b: any) => dayjs(a.submittedAt).valueOf() - dayjs(b.submittedAt).valueOf(),
      defaultSortOrder: "ascend" as const,
      render: (submittedAt: string) => (
        <Tooltip title={dayjs(submittedAt).format("DD MMM YYYY, HH:mm")}>
          <Text>{dayjs(submittedAt).format("DD MMM YYYY")}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Waiting",
      key: "waiting",
      width: 110,
      sorter: (a: any, b: any) => dayjs(a.submittedAt).valueOf() - dayjs(b.submittedAt).valueOf(),
      render: (_: any, item: any) => {
        const days = dayjs().diff(dayjs(item.submittedAt), "day");
        const color = days >= 7 ? "red" : days >= 3 ? "orange" : "default";
        return (
          <Tag color={color} style={{ margin: 0 }}>
            {days === 0 ? "Today" : `${days}d`}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 260,
      fixed: "right" as const,
      render: (_: any, item: any) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setSelected(item)}
          >
            Review
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleApprove(item)}
          >
            Approve
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseCircleOutlined />}
            onClick={() => handleReject(item)}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout maxWidth={1440}>
      <Row align="middle" justify="space-between" gutter={[16, 16]}>
        <Col>
          <Title level={3} style={{ marginTop: 8, marginBottom: 0 }}>
            Pending Approvals
          </Title>
          <Text type="secondary">
            Review seller registrations and product listings waiting for action.
          </Text>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<AuditOutlined />}
            iconBg="#fa8c16"
            title="Total pending"
            value={stats.total}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<ShopOutlined />}
            iconBg="#722ed1"
            title="Seller registrations"
            value={stats.seller}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<AppstoreOutlined />}
            iconBg="#13c2c2"
            title="Product listings"
            value={stats.product}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<ClockCircleOutlined />}
            iconBg={stats.oldestDays >= 7 ? "#cf1322" : "#1677ff"}
            title="Oldest waiting"
            value={stats.oldestDays}
            suffix={
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 6 }}>
                {stats.oldestDays === 1 ? "day" : "days"}
              </Text>
            }
          />
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }} styles={{ body: { padding: 16 } }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} lg={10}>
            <Segmented
              value={type}
              onChange={setType}
              options={typeOptions}
              size="large"
              style={{ maxWidth: "100%", overflowX: "auto" }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              size="large"
              value={category}
              onChange={setCategory}
              style={{ width: "100%" }}
              options={categoryOptions}
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <RangePicker
              size="large"
              style={{ width: "100%" }}
              value={dateRange}
              onChange={setDateRange}
              allowClear
              placeholder={["Submitted from", "Submitted to"]}
            />
          </Col>
          <Col xs={24} md={18}>
            <Input
              size="large"
              allowClear
              prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
              placeholder="Search by name, ID or applicant"
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
            <Text strong>Review queue</Text>
            <Tag color="orange" style={{ margin: 0 }}>
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
            showTotal: (total) => `${formatNumber(total)} requests`,
          }}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No pending approvals — you're all caught up"
              />
            ),
          }}
        />
      </Card>

      <ApprovalDrawer
        open={Boolean(selected)}
        item={selected}
        onClose={() => setSelected(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </AdminLayout>
  );
}
