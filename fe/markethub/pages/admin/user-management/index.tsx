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
  UserOutlined,
  ShopOutlined,
  EyeOutlined,
  StopOutlined,
  CheckCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  UserAddOutlined,
  MoreOutlined,
  ReloadOutlined,
  ExportOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui";
import { formatPrice } from "@/utils/customMethods";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ROLE_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  buyer: { label: "Buyer", color: "blue", icon: <UserOutlined /> },
  seller: { label: "Seller", color: "purple", icon: <ShopOutlined /> },
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "green" },
  inactive: { label: "Inactive", color: "red" },
};

const formatNumber = (value: number | undefined) => Number(value || 0).toLocaleString("en-IN");

const RoleTag = ({ role }: { role: string }) => {
  const meta = ROLE_META[role] || ROLE_META.buyer;
  return (
    <Tag color={meta.color} icon={meta.icon} style={{ margin: 0 }}>
      {meta.label}
    </Tag>
  );
};

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
  suffix?: React.ReactNode;
}

const StatCard = ({ icon, iconBg, title, value, suffix }: StatCardProps) => (
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
          formatter={(v) => formatNumber(Number(v))}
          suffix={suffix}
          valueStyle={{ fontSize: 22, fontWeight: 600, lineHeight: 1.2 }}
        />
      </div>
    </Space>
  </Card>
);

interface ProfileDrawerProps {
  open: boolean;
  user: any;
  onClose: () => void;
  onToggleStatus: (user: any) => void;
}

const ProfileDrawer = ({ open, user, onClose, onToggleStatus }: ProfileDrawerProps) => {
  if (!user) return null;
  const isSeller = user.role === "seller";
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={Math.min(480, typeof window !== "undefined" ? window.innerWidth : 480)}
      title="User profile"
      destroyOnHidden
    >
      <Space align="center" size={16} style={{ marginBottom: 20 }}>
        <Avatar size={64} src={user.avatar} icon={<UserOutlined />} />
        <div>
          <Title level={4} style={{ margin: 0 }}>
            {user.name}
          </Title>
          <Space size={8} wrap style={{ marginTop: 4 }}>
            <RoleTag role={user.role} />
            <StatusTag status={user.status} />
          </Space>
        </div>
      </Space>

      <Descriptions column={1} size="small" colon={false} bordered>
        <Descriptions.Item label="User ID">{user.id}</Descriptions.Item>
        <Descriptions.Item label={<Space size={6}><MailOutlined />Email</Space>}>
          {user.email}
        </Descriptions.Item>
        <Descriptions.Item label={<Space size={6}><PhoneOutlined />Phone</Space>}>
          {user.phone}
        </Descriptions.Item>
        <Descriptions.Item label={<Space size={6}><EnvironmentOutlined />Location</Space>}>
          {user.location}
        </Descriptions.Item>
        <Descriptions.Item label={<Space size={6}><ClockCircleOutlined />Joined</Space>}>
          {dayjs(user.joinedAt).format("DD MMM YYYY")}
        </Descriptions.Item>

        {isSeller ? (
          <>
            <Descriptions.Item label="Business">{user.businessName}</Descriptions.Item>
            <Descriptions.Item label="Category">{user.category}</Descriptions.Item>
            <Descriptions.Item label="Products listed">
              {formatNumber(user.productsCount)}
            </Descriptions.Item>
            <Descriptions.Item label="Total sales">
              {formatPrice(user.totalSales, "INR")}
            </Descriptions.Item>
          </>
        ) : (
          <>
            <Descriptions.Item label="Orders placed">
              {formatNumber(user.ordersCount)}
            </Descriptions.Item>
            <Descriptions.Item label="Total spend">
              {formatPrice(user.totalSpend, "INR")}
            </Descriptions.Item>
          </>
        )}
      </Descriptions>

      <div style={{ marginTop: 24 }}>
        {user.status === "active" ? (
          <Button
            danger
            block
            icon={<StopOutlined />}
            onClick={() => onToggleStatus(user)}
          >
            Deactivate account
          </Button>
        ) : (
          <Button
            block
            icon={<CheckCircleOutlined />}
            onClick={() => onToggleStatus(user)}
          >
            Activate account
          </Button>
        )}
      </div>
    </Drawer>
  );
};

export default function AdminUserManagementPage() {
  const { modal, message } = App.useApp();
  const [users, setUsers] = useState<any[]>([]);
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);

  const stats = useMemo(() => {
    const acc: Record<string, number> = { total: users.length, buyer: 0, seller: 0, active: 0, inactive: 0 };
    for (const u of users) {
      acc[u.role] = (acc[u.role] || 0) + 1;
      acc[u.status] = (acc[u.status] || 0) + 1;
    }
    return acc;
  }, [users]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const [start, end] = dateRange || [];
    return users.filter((u) => {
      if (role !== "all" && u.role !== role) return false;
      if (status !== "all" && u.status !== status) return false;
      if (
        term &&
        !u.name.toLowerCase().includes(term) &&
        !u.email.toLowerCase().includes(term) &&
        !u.id.toLowerCase().includes(term)
      )
        return false;
      if (start && dayjs(u.joinedAt).isBefore(start, "day")) return false;
      if (end && dayjs(u.joinedAt).isAfter(end, "day")) return false;
      return true;
    });
  }, [users, role, status, search, dateRange]);

  const applyStatus = (user: any, nextStatus: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
    );
    setSelected((prev: any) =>
      prev && prev.id === user.id ? { ...prev, status: nextStatus } : prev
    );
  };

  const handleToggleStatus = (user: any) => {
    if (user.status === "active") {
      modal.confirm({
        title: `Deactivate ${user.name}?`,
        content:
          "The user will lose access until reactivated. Existing orders are not affected.",
        okText: "Deactivate",
        okButtonProps: { danger: true },
        cancelText: "Cancel",
        onOk: () => {
          applyStatus(user, "inactive");
          message.success(`${user.name} deactivated`);
        },
      });
    } else {
      applyStatus(user, "active");
      message.success(`${user.name} activated`);
    }
  };

  const handleResetFilters = () => {
    setRole("all");
    setStatus("all");
    setSearch("");
    setDateRange(null);
  };

  const roleOptions = [
    { value: "all", label: `All (${stats.total})` },
    { value: "buyer", label: `Buyers (${stats.buyer || 0})` },
    { value: "seller", label: `Sellers (${stats.seller || 0})` },
  ];

  const columns = [
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      render: (_: any, user: any) => (
        <Space size={12}>
          <Avatar src={user.avatar} icon={<UserOutlined />} />
          <div style={{ minWidth: 0 }}>
            <a onClick={() => setSelected(user)} style={{ fontWeight: 500 }}>
              {user.name}
            </a>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {user.email}
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
      width: 130,
      render: (id: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {id}
        </Text>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 120,
      filters: [
        { text: "Buyer", value: "buyer" },
        { text: "Seller", value: "seller" },
      ],
      onFilter: (value: any, record: any) => record.role === value,
      render: (r: string) => <RoleTag role={r} />,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (s: string) => <StatusTag status={s} />,
    },
    {
      title: "Activity",
      key: "activity",
      width: 220,
      render: (_: any, user: any) =>
        user.role === "seller" ? (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {formatNumber(user.productsCount)} products ·{" "}
            {formatPrice(user.totalSales, "INR")}
          </Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {formatNumber(user.ordersCount)} orders ·{" "}
            {formatPrice(user.totalSpend, "INR")}
          </Text>
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
      render: (_: any, user: any) => {
        const menuItems = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "View profile",
            onClick: () => setSelected(user),
          },
          { type: "divider" as const },
          user.status === "active"
            ? {
                key: "deactivate",
                icon: <StopOutlined />,
                label: "Deactivate",
                danger: true,
                onClick: () => handleToggleStatus(user),
              }
            : {
                key: "activate",
                icon: <CheckCircleOutlined />,
                label: "Activate",
                onClick: () => handleToggleStatus(user),
              },
        ];
        return (
          <Space>
            <Button
              type="default"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setSelected(user)}
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
            User Management
          </Title>
          <Text type="secondary">
            View, filter, and manage all buyers and sellers on the platform.
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
              icon={<UserAddOutlined />}
              onClick={() => message.info("Add user coming soon")}
            >
              Add user
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<TeamOutlined />}
            iconBg="#1677ff"
            title="Total users"
            value={stats.total}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<UserOutlined />}
            iconBg="#3b82f6"
            title="Buyers"
            value={stats.buyer || 0}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<ShopOutlined />}
            iconBg="#722ed1"
            title="Sellers"
            value={stats.seller || 0}
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
      </Row>

      <Card style={{ marginTop: 16 }} styles={{ body: { padding: 16 } }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} lg={10}>
            <Segmented
              value={role}
              onChange={setRole}
              options={roleOptions}
              size="large"
              style={{ maxWidth: "100%", overflowX: "auto" }}
            />
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Select
              size="large"
              value={status}
              onChange={setStatus}
              style={{ width: "100%" }}
              options={[
                { value: "all", label: "All statuses" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} lg={9}>
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
              placeholder="Search by name, email or user ID"
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
            <Text strong>Users</Text>
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
            showTotal: (total) => `${formatNumber(total)} users`,
          }}
          scroll={{ x: 1100 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No users match these filters"
              />
            ),
          }}
        />
      </Card>

      <ProfileDrawer
        open={Boolean(selected)}
        user={selected}
        onClose={() => setSelected(null)}
        onToggleStatus={handleToggleStatus}
      />
    </AppLayout>
  );
}
