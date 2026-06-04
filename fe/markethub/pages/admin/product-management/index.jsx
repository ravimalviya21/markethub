import { useMemo, useState } from "react";
import {
  App,
  Avatar,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Drawer,
  Dropdown,
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
  AppstoreOutlined,
  EyeOutlined,
  StopOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShopOutlined,
  PlusOutlined,
  MoreOutlined,
  ReloadOutlined,
  ExportOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  TagsOutlined,
  InboxOutlined,
  TagOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui";
import { ADMIN_PRODUCTS } from "@/utils/dummy";
import { formatPrice } from "@/utils/customMethods";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const STATUS_META = {
  active: { label: "Active", color: "green" },
  pending: { label: "Pending", color: "gold" },
  inactive: { label: "Inactive", color: "default" },
  out_of_stock: { label: "Out of stock", color: "orange" },
  rejected: { label: "Rejected", color: "red" },
};

const LOW_STOCK_THRESHOLD = 10;

const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

const StatusTag = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.active;
  return (
    <Tag color={meta.color} style={{ margin: 0 }}>
      {meta.label}
    </Tag>
  );
};

const computeDiscount = (mrp, price) => {
  if (!mrp || !price || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
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

const ProductDrawer = ({ open, product, onClose, onApprove, onReject, onToggleStatus }) => {
  if (!product) return null;
  const isPending = product.status === "pending";
  const isActive = product.status === "active";
  const isRejected = product.status === "rejected";
  const discount = computeDiscount(product.mrp, product.price);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={Math.min(480, typeof window !== "undefined" ? window.innerWidth : 480)}
      title="Product details"
      destroyOnHidden
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <Image
          src={product.image}
          alt={product.name}
          width={220}
          height={220}
          style={{ borderRadius: 12, objectFit: "cover" }}
          fallback="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
        />
      </div>

      <Title level={4} style={{ margin: 0 }}>
        {product.name}
      </Title>
      <Space size={8} wrap style={{ marginTop: 8, marginBottom: 16 }}>
        <StatusTag status={product.status} />
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
          {product.stock === 0 ? (
            <Tag color="red" style={{ margin: 0 }}>Out of stock</Tag>
          ) : product.stock < LOW_STOCK_THRESHOLD ? (
            <Space size={6}>
              <Text>{formatNumber(product.stock)}</Text>
              <Tag color="orange" style={{ margin: 0 }}>Low</Tag>
            </Space>
          ) : (
            <Text>{formatNumber(product.stock)}</Text>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Units sold">
          {formatNumber(product.sold)}
        </Descriptions.Item>
        <Descriptions.Item label="Rating">
          {product.rating ? (
            <Space size={6}>
              <Rate disabled allowHalf value={product.rating} style={{ fontSize: 14 }} />
              <Text type="secondary">
                {product.rating.toFixed(1)} · {formatNumber(product.reviewsCount)} reviews
              </Text>
            </Space>
          ) : (
            "—"
          )}
        </Descriptions.Item>
        <Descriptions.Item label={<Space size={6}><ClockCircleOutlined />Added</Space>}>
          {dayjs(product.addedAt).format("DD MMM YYYY")}
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 24 }}>
        {isPending ? (
          <Space style={{ width: "100%" }} direction="vertical">
            <Button
              type="primary"
              block
              icon={<CheckCircleOutlined />}
              onClick={() => onApprove(product)}
            >
              Approve listing
            </Button>
            <Button
              danger
              block
              icon={<CloseCircleOutlined />}
              onClick={() => onReject(product)}
            >
              Reject listing
            </Button>
          </Space>
        ) : isActive ? (
          <Button
            danger
            block
            icon={<StopOutlined />}
            onClick={() => onToggleStatus(product)}
          >
            Deactivate product
          </Button>
        ) : isRejected ? (
          <Button
            type="primary"
            block
            icon={<CheckCircleOutlined />}
            onClick={() => onApprove(product)}
          >
            Reinstate listing
          </Button>
        ) : (
          <Button
            block
            icon={<CheckCircleOutlined />}
            onClick={() => onToggleStatus(product)}
          >
            Reactivate product
          </Button>
        )}
      </div>
    </Drawer>
  );
};

export default function AdminProductManagementPage() {
  const { modal, message } = App.useApp();
  const [products, setProducts] = useState(ADMIN_PRODUCTS);
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [seller, setSeller] = useState("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [selected, setSelected] = useState(null);

  const stats = useMemo(() => {
    const acc = {
      total: products.length,
      active: 0,
      pending: 0,
      inactive: 0,
      out_of_stock: 0,
      rejected: 0,
      lowStock: 0,
      revenue: 0,
    };
    for (const p of products) {
      acc[p.status] = (acc[p.status] || 0) + 1;
      if (p.stock > 0 && p.stock < LOW_STOCK_THRESHOLD) acc.lowStock += 1;
      acc.revenue += Number(p.price || 0) * Number(p.sold || 0);
    }
    return acc;
  }, [products]);

  const categoryOptions = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return [
      { value: "all", label: "All categories" },
      ...Array.from(set).map((c) => ({ value: c, label: c })),
    ];
  }, [products]);

  const sellerOptions = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      if (p.sellerName && !map.has(p.sellerName)) {
        map.set(p.sellerName, p.sellerName);
      }
    }
    return [
      { value: "all", label: "All sellers" },
      ...Array.from(map.values()).map((s) => ({ value: s, label: s })),
    ];
  }, [products]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const [start, end] = dateRange || [];
    return products.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (category !== "all" && p.category !== category) return false;
      if (seller !== "all" && p.sellerName !== seller) return false;
      if (
        term &&
        !p.name.toLowerCase().includes(term) &&
        !p.id.toLowerCase().includes(term) &&
        !p.sellerName.toLowerCase().includes(term)
      )
        return false;
      if (start && dayjs(p.addedAt).isBefore(start, "day")) return false;
      if (end && dayjs(p.addedAt).isAfter(end, "day")) return false;
      return true;
    });
  }, [products, status, category, seller, search, dateRange]);

  const applyStatus = (product, nextStatus) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, status: nextStatus } : p))
    );
    setSelected((prev) =>
      prev && prev.id === product.id ? { ...prev, status: nextStatus } : prev
    );
  };

  const handleApprove = (product) => {
    modal.confirm({
      title: `Approve ${product.name}?`,
      content: "The product will be listed and become available to buyers.",
      okText: "Approve",
      cancelText: "Cancel",
      onOk: () => {
        applyStatus(product, "active");
        message.success(`${product.name} approved`);
      },
    });
  };

  const handleReject = (product) => {
    modal.confirm({
      title: `Reject ${product.name}?`,
      content:
        "The listing will be marked as rejected. The seller can be notified separately.",
      okText: "Reject",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: () => {
        applyStatus(product, "rejected");
        message.success(`${product.name} rejected`);
      },
    });
  };

  const handleToggleStatus = (product) => {
    if (product.status === "active") {
      modal.confirm({
        title: `Deactivate ${product.name}?`,
        content:
          "The product will be hidden from buyers until reactivated. Existing orders are not affected.",
        okText: "Deactivate",
        okButtonProps: { danger: true },
        cancelText: "Cancel",
        onOk: () => {
          applyStatus(product, "inactive");
          message.success(`${product.name} deactivated`);
        },
      });
    } else {
      applyStatus(product, "active");
      message.success(`${product.name} reactivated`);
    }
  };

  const handleResetFilters = () => {
    setStatus("all");
    setCategory("all");
    setSeller("all");
    setSearch("");
    setDateRange(null);
  };

  const statusOptions = [
    { value: "all", label: `All (${stats.total})` },
    { value: "active", label: `Active (${stats.active || 0})` },
    { value: "pending", label: `Pending (${stats.pending || 0})` },
    { value: "out_of_stock", label: `Out of stock (${stats.out_of_stock || 0})` },
    { value: "inactive", label: `Inactive (${stats.inactive || 0})` },
    { value: "rejected", label: `Rejected (${stats.rejected || 0})` },
  ];

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, product) => (
        <Space size={12}>
          <Avatar
            shape="square"
            size={48}
            src={product.image}
            icon={<AppstoreOutlined />}
          />
          <div style={{ minWidth: 0 }}>
            <a onClick={() => setSelected(product)} style={{ fontWeight: 500 }}>
              {product.name}
            </a>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {product.id} · {product.category}
              </Text>
            </div>
          </div>
        </Space>
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
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 150,
      sorter: (a, b) => a.price - b.price,
      render: (price, product) => {
        const discount = computeDiscount(product.mrp, price);
        return (
          <div>
            <Text strong>{formatPrice(price, "INR")}</Text>
            {discount > 0 && (
              <div>
                <Text type="secondary" delete style={{ fontSize: 11 }}>
                  {formatPrice(product.mrp, "INR")}
                </Text>{" "}
                <Text style={{ fontSize: 11, color: "#cf1322" }}>{discount}% off</Text>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      width: 120,
      sorter: (a, b) => a.stock - b.stock,
      render: (stock) => {
        if (stock === 0) return <Tag color="red" style={{ margin: 0 }}>Out</Tag>;
        if (stock < LOW_STOCK_THRESHOLD)
          return (
            <Space size={6}>
              <Text>{formatNumber(stock)}</Text>
              <Tag color="orange" style={{ margin: 0 }}>Low</Tag>
            </Space>
          );
        return <Text>{formatNumber(stock)}</Text>;
      },
    },
    {
      title: "Sold",
      dataIndex: "sold",
      key: "sold",
      width: 100,
      sorter: (a, b) => a.sold - b.sold,
      render: (v) => formatNumber(v),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      width: 110,
      sorter: (a, b) => (a.rating || 0) - (b.rating || 0),
      render: (r, product) =>
        r ? (
          <Tooltip title={`${formatNumber(product.reviewsCount)} reviews`}>
            <Text>{r.toFixed(1)} ★</Text>
          </Tooltip>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (s) => <StatusTag status={s} />,
    },
    {
      title: "Added",
      dataIndex: "addedAt",
      key: "addedAt",
      width: 130,
      sorter: (a, b) => dayjs(a.addedAt).valueOf() - dayjs(b.addedAt).valueOf(),
      defaultSortOrder: "descend",
      render: (addedAt) => dayjs(addedAt).format("DD MMM YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      fixed: "right",
      render: (_, product) => {
        const menuItems = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "View details",
            onClick: () => setSelected(product),
          },
          { type: "divider" },
          ...(product.status === "pending"
            ? [
                {
                  key: "approve",
                  icon: <CheckCircleOutlined />,
                  label: "Approve",
                  onClick: () => handleApprove(product),
                },
                {
                  key: "reject",
                  icon: <CloseCircleOutlined />,
                  label: "Reject",
                  danger: true,
                  onClick: () => handleReject(product),
                },
              ]
            : product.status === "active"
            ? [
                {
                  key: "deactivate",
                  icon: <StopOutlined />,
                  label: "Deactivate",
                  danger: true,
                  onClick: () => handleToggleStatus(product),
                },
              ]
            : product.status === "rejected"
            ? [
                {
                  key: "reinstate",
                  icon: <CheckCircleOutlined />,
                  label: "Reinstate",
                  onClick: () => handleApprove(product),
                },
              ]
            : [
                {
                  key: "activate",
                  icon: <CheckCircleOutlined />,
                  label: "Reactivate",
                  onClick: () => handleToggleStatus(product),
                },
              ]),
        ];
        return (
          <Space>
            <Button
              type="default"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setSelected(product)}
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

  return (
    <AdminLayout maxWidth={1440}>
      <Row align="middle" justify="space-between" gutter={[16, 16]}>
        <Col>
          <Title level={3} style={{ marginTop: 8, marginBottom: 0 }}>
            Product Management
          </Title>
          <Text type="secondary">
            Approve listings, monitor stock, and manage every product on the platform.
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
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => message.info("Add product coming soon")}
            >
              Add product
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<AppstoreOutlined />}
            iconBg="#13c2c2"
            title="Total products"
            value={stats.total}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<CheckCircleOutlined />}
            iconBg="#52c41a"
            title="Active"
            value={stats.active || 0}
            suffix={
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 6 }}>
                / {stats.inactive || 0} inactive
              </Text>
            }
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<ClockCircleOutlined />}
            iconBg="#fa8c16"
            title="Pending review"
            value={stats.pending || 0}
            suffix={
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 6 }}>
                · {stats.lowStock} low stock
              </Text>
            }
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<DollarOutlined />}
            iconBg="#1677ff"
            title="Gross revenue"
            value={stats.revenue}
            formatter={(v) => formatPrice(v, "INR")}
          />
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }} styles={{ body: { padding: 16 } }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} lg={14}>
            <Segmented
              value={status}
              onChange={setStatus}
              options={statusOptions}
              size="large"
              style={{ maxWidth: "100%", overflowX: "auto" }}
            />
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Select
              size="large"
              value={category}
              onChange={setCategory}
              style={{ width: "100%" }}
              options={categoryOptions}
              suffixIcon={<TagsOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Select
              size="large"
              value={seller}
              onChange={setSeller}
              style={{ width: "100%" }}
              options={sellerOptions}
              suffixIcon={<ShopOutlined />}
              showSearch
              optionFilterProp="label"
            />
          </Col>
          <Col xs={24} lg={10}>
            <RangePicker
              size="large"
              style={{ width: "100%" }}
              value={dateRange}
              onChange={setDateRange}
              allowClear
              placeholder={["Added from", "Added to"]}
            />
          </Col>
          <Col xs={24} md={18} lg={8}>
            <Input
              size="large"
              allowClear
              prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
              placeholder="Search by name, product ID or seller"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
          <Col xs={24} md={6} lg={6}>
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
            <Text strong>Products</Text>
            <Tag color="cyan" style={{ margin: 0 }}>
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
            showTotal: (total) => `${formatNumber(total)} products`,
          }}
          scroll={{ x: 1400 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No products match these filters"
              />
            ),
          }}
        />
      </Card>

      <ProductDrawer
        open={Boolean(selected)}
        product={selected}
        onClose={() => setSelected(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onToggleStatus={handleToggleStatus}
      />
    </AdminLayout>
  );
}
