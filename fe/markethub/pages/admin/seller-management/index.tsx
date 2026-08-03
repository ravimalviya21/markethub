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
  ShopOutlined,
  EyeOutlined,
  StopOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UserOutlined,
  PlusOutlined,
  MoreOutlined,
  ReloadOutlined,
  ExportOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  AuditOutlined,
  AppstoreOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui";
import { formatPrice } from "@/utils/customMethods";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const STATUS_META: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "green" },
  pending: { label: "Pending", color: "gold" },
  inactive: { label: "Inactive", color: "default" },
  suspended: { label: "Suspended", color: "red" },
};

const formatNumber = (value: number | undefined) => Number(value || 0).toLocaleString("en-IN");

const StatusTag = ({ status }: { status: string }) => {
  const meta = STATUS_META[status] || STATUS_META.active;
  return (
    <Tag color={meta.color} style={{ margin: 0 }}>
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

interface SellerDrawerProps {
  open: boolean;
  seller: any;
  onClose: () => void;
  onApprove: (seller: any) => void;
  onReject: (seller: any) => void;
  onToggleStatus: (seller: any) => void;
}

const SellerDrawer = ({ open, seller, onClose, onApprove, onReject, onToggleStatus }: SellerDrawerProps) => {
  if (!seller) return null;
  const isPending = seller.status === "pending";
  const isActive = seller.status === "active";
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={Math.min(480, typeof window !== "undefined" ? window.innerWidth : 480)}
      title="Seller profile"
      destroyOnHidden
    >
      <Space align="center" size={16} style={{ marginBottom: 20 }}>
        <Avatar size={64} src={seller.avatar} icon={<ShopOutlined />} />
        <div>
          <Title level={4} style={{ margin: 0 }}>
            {seller.businessName}
          </Title>
          <Text type="secondary">{seller.contactName}</Text>
          <div style={{ marginTop: 6 }}>
            <StatusTag status={seller.status} />
          </div>
        </div>
      </Space>

      <Descriptions column={1} size="small" colon={false} bordered>
        <Descriptions.Item label="Seller ID">{seller.id}</Descriptions.Item>
        <Descriptions.Item label="Category">{seller.category}</Descriptions.Item>
        <Descriptions.Item label={<Space size={6}><IdcardOutlined />GSTIN</Space>}>
          {seller.gstin || "—"}
        </Descriptions.Item>
        <Descriptions.Item label={<Space size={6}><UserOutlined />Contact</Space>}>
          {seller.contactName}
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
        <Descriptions.Item label={<Space size={6}><ClockCircleOutlined />{isPending ? "Applied" : "Joined"}</Space>}>
          {dayjs(seller.joinedAt).format("DD MMM YYYY")}
        </Descriptions.Item>
        {!isPending && (
          <>
            <Descriptions.Item label="Products listed">
              {formatNumber(seller.productsCount)}
            </Descriptions.Item>
            <Descriptions.Item label="Orders fulfilled">
              {formatNumber(seller.ordersCount)}
            </Descriptions.Item>
            <Descriptions.Item label="Total sales">
              {formatPrice(seller.totalSales, "INR")}
            </Descriptions.Item>
            <Descriptions.Item label="Rating">
              {seller.rating ? (
                <Space size={6}>
                  <Rate disabled allowHalf value={seller.rating} style={{ fontSize: 14 }} />
                  <Text type="secondary">{seller.rating.toFixed(1)}</Text>
                </Space>
              ) : (
                "—"
              )}
            </Descriptions.Item>
          </>
        )}
      </Descriptions>

      <div style={{ marginTop: 24 }}>
        {isPending ? (
          <Space style={{ width: "100%" }} direction="vertical">
            <Button
              type="primary"
              block
              icon={<CheckCircleOutlined />}
              onClick={() => onApprove(seller)}
            >
              Approve seller
            </Button>
            <Button
              danger
              block
              icon={<CloseCircleOutlined />}
              onClick={() => onReject(seller)}
            >
              Reject application
            </Button>
          </Space>
        ) : isActive ? (
          <Button
            danger
            block
            icon={<StopOutlined />}
            onClick={() => onToggleStatus(seller)}
          >
            Deactivate seller
          </Button>
        ) : (
          <Button
            block
            icon={<CheckCircleOutlined />}
            onClick={() => onToggleStatus(seller)}
          >
            Reactivate seller
          </Button>
        )}
      </div>
    </Drawer>
  );
};

export default function AdminSellerManagementPage() {
  const { modal, message } = App.useApp();
  const [sellers, setSellers] = useState<any[]>([]);
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);

  const stats = useMemo(() => {
    const acc: Record<string, number> = {
      total: sellers.length,
      active: 0,
      pending: 0,
      inactive: 0,
      suspended: 0,
      totalSales: 0,
    };
    for (const s of sellers) {
      acc[s.status] = (acc[s.status] || 0) + 1;
      acc.totalSales += Number(s.totalSales || 0);
    }
    return acc;
  }, [sellers]);

  const categoryOptions = useMemo(() => {
    const set = new Set(sellers.map((s) => s.category).filter(Boolean));
    return [
      { value: "all", label: "All categories" },
      ...Array.from(set).map((c) => ({ value: c, label: c })),
    ];
  }, [sellers]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const [start, end] = dateRange || [];
    return sellers.filter((s) => {
      if (status !== "all" && s.status !== status) return false;
      if (category !== "all" && s.category !== category) return false;
      if (
        term &&
        !s.businessName.toLowerCase().includes(term) &&
        !s.contactName.toLowerCase().includes(term) &&
        !s.email.toLowerCase().includes(term) &&
        !s.id.toLowerCase().includes(term)
      )
        return false;
      if (start && dayjs(s.joinedAt).isBefore(start, "day")) return false;
      if (end && dayjs(s.joinedAt).isAfter(end, "day")) return false;
      return true;
    });
  }, [sellers, status, category, search, dateRange]);

  const applyStatus = (seller: any, nextStatus: string) => {
    setSellers((prev) =>
      prev.map((s) => (s.id === seller.id ? { ...s, status: nextStatus } : s))
    );
    setSelected((prev: any) =>
      prev && prev.id === seller.id ? { ...prev, status: nextStatus } : prev
    );
  };

  const handleApprove = (seller: any) => {
    modal.confirm({
      title: `Approve ${seller.businessName}?`,
      content: "The seller will be able to list products and receive orders.",
      okText: "Approve",
      cancelText: "Cancel",
      onOk: () => {
        applyStatus(seller, "active");
        message.success(`${seller.businessName} approved`);
      },
    });
  };

  const handleReject = (seller: any) => {
    modal.confirm({
      title: `Reject ${seller.businessName}?`,
      content:
        "The seller application will be marked as suspended. You can re-enable it later if needed.",
      okText: "Reject",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: () => {
        applyStatus(seller, "suspended");
        message.success(`${seller.businessName} application rejected`);
      },
    });
  };

  const handleToggleStatus = (seller: any) => {
    if (seller.status === "active") {
      modal.confirm({
        title: `Deactivate ${seller.businessName}?`,
        content:
          "Their storefront will be hidden until reactivated. In-flight orders are not affected.",
        okText: "Deactivate",
        okButtonProps: { danger: true },
        cancelText: "Cancel",
        onOk: () => {
          applyStatus(seller, "inactive");
          message.success(`${seller.businessName} deactivated`);
        },
      });
    } else {
      applyStatus(seller, "active");
      message.success(`${seller.businessName} reactivated`);
    }
  };

  const handleResetFilters = () => {
    setStatus("all");
    setCategory("all");
    setSearch("");
    setDateRange(null);
  };

  const statusOptions = [
    { value: "all", label: `All (${stats.total})` },
    { value: "active", label: `Active (${stats.active || 0})` },
    { value: "pending", label: `Pending (${stats.pending || 0})` },
    { value: "inactive", label: `Inactive (${stats.inactive || 0})` },
    { value: "suspended", label: `Suspended (${stats.suspended || 0})` },
  ];

  const columns = [
    {
      title: "Seller",
      dataIndex: "businessName",
      key: "businessName",
      sorter: (a: any, b: any) => a.businessName.localeCompare(b.businessName),
      render: (_: any, seller: any) => (
        <Space size={12}>
          <Avatar src={seller.avatar} icon={<ShopOutlined />} />
          <div style={{ minWidth: 0 }}>
            <a onClick={() => setSelected(seller)} style={{ fontWeight: 500 }}>
              {seller.businessName}
            </a>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {seller.contactName} · {seller.email}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 120,
      render: (id: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {id}
        </Text>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (c: string) => <Tag style={{ margin: 0 }}>{c}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (s: string) => <StatusTag status={s} />,
    },
    {
      title: "Products",
      dataIndex: "productsCount",
      key: "productsCount",
      width: 110,
      sorter: (a: any, b: any) => a.productsCount - b.productsCount,
      render: (v: number) => formatNumber(v),
    },
    {
      title: "Sales",
      dataIndex: "totalSales",
      key: "totalSales",
      width: 140,
      sorter: (a: any, b: any) => a.totalSales - b.totalSales,
      render: (v: number) => formatPrice(v, "INR"),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      width: 110,
      sorter: (a: any, b: any) => (a.rating || 0) - (b.rating || 0),
      render: (r: number | null) =>
        r ? (
          <Text>{r.toFixed(1)} ★</Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Joined",
      dataIndex: "joinedAt",
      key: "joinedAt",
      width: 130,
      sorter: (a: any, b: any) => dayjs(a.joinedAt).valueOf() - dayjs(b.joinedAt).valueOf(),
      defaultSortOrder: "descend" as const,
      render: (joinedAt: string) => dayjs(joinedAt).format("DD MMM YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      fixed: "right" as const,
      render: (_: any, seller: any) => {
        const menuItems = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "View profile",
            onClick: () => setSelected(seller),
          },
          { type: "divider" as const },
          ...(seller.status === "pending"
            ? [
                {
                  key: "approve",
                  icon: <CheckCircleOutlined />,
                  label: "Approve",
                  onClick: () => handleApprove(seller),
                },
                {
                  key: "reject",
                  icon: <CloseCircleOutlined />,
                  label: "Reject",
                  danger: true,
                  onClick: () => handleReject(seller),
                },
              ]
            : seller.status === "active"
            ? [
                {
                  key: "deactivate",
                  icon: <StopOutlined />,
                  label: "Deactivate",
                  danger: true,
                  onClick: () => handleToggleStatus(seller),
                },
              ]
            : [
                {
                  key: "activate",
                  icon: <CheckCircleOutlined />,
                  label: "Reactivate",
                  onClick: () => handleToggleStatus(seller),
                },
              ]),
        ];
        return (
          <Space>
            <Button
              type="default"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setSelected(seller)}
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
    <AppLayout role="admin" maxWidth={1440}>
      <Row align="middle" justify="space-between" gutter={[16, 16]}>
        <Col>
          <Title level={3} style={{ marginTop: 8, marginBottom: 0 }}>
            Seller Management
          </Title>
          <Text type="secondary">
            Review applications, monitor performance, and manage seller accounts.
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
              onClick={() => message.info("Onboard seller coming soon")}
            >
              Onboard seller
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<ShopOutlined />}
            iconBg="#722ed1"
            title="Total sellers"
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
            icon={<AuditOutlined />}
            iconBg="#fa8c16"
            title="Pending approvals"
            value={stats.pending || 0}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<DollarOutlined />}
            iconBg="#1677ff"
            title="Total sales"
            value={stats.totalSales}
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
          <Col xs={24} sm={12} lg={4}>
            <Select
              size="large"
              value={category}
              onChange={setCategory}
              style={{ width: "100%" }}
              options={categoryOptions}
              suffixIcon={<AppstoreOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <RangePicker
              size="large"
              style={{ width: "100%" }}
              value={dateRange}
              onChange={setDateRange}
              allowClear
              placeholder={["Joined from", "Joined to"]}
            />
          </Col>
          <Col xs={24} md={18}>
            <Input
              size="large"
              allowClear
              prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
              placeholder="Search by business, contact, email or seller ID"
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
            <Text strong>Sellers</Text>
            <Tag color="purple" style={{ margin: 0 }}>
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
            showTotal: (total) => `${formatNumber(total)} sellers`,
          }}
          scroll={{ x: 1300 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No sellers match these filters"
              />
            ),
          }}
        />
      </Card>

      <SellerDrawer
        open={Boolean(selected)}
        seller={selected}
        onClose={() => setSelected(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onToggleStatus={handleToggleStatus}
      />
    </AppLayout>
  );
}
