import { useMemo, useState } from "react";
import {
  App,
  Avatar,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Drawer,
  Input,
  Row,
  Segmented,
  Select,
  Space,
  Table,
  Tag,
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
} from "@ant-design/icons";
import dayjs from "dayjs";

import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui";
import { ADMIN_USERS } from "@/utils/dummy";
import { formatPrice } from "@/utils/customMethods";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ROLE_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  buyer: { label: "Buyer", color: "blue", icon: <UserOutlined /> },
  seller: { label: "Seller", color: "purple", icon: <ShopOutlined /> },
};

const STATUS_META: Record<string, { label: string; color: string; badge: string }> = {
  active: { label: "Active", color: "green", badge: "success" },
  inactive: { label: "Inactive", color: "red", badge: "error" },
};

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
        <Descriptions.Item label="Joined">
          {dayjs(user.joinedAt).format("DD MMM YYYY")}
        </Descriptions.Item>

        {isSeller ? (
          <>
            <Descriptions.Item label="Business">{user.businessName}</Descriptions.Item>
            <Descriptions.Item label="Category">{user.category}</Descriptions.Item>
            <Descriptions.Item label="Products listed">{user.productsCount}</Descriptions.Item>
            <Descriptions.Item label="Total sales">
              {formatPrice(user.totalSales, "INR")}
            </Descriptions.Item>
          </>
        ) : (
          <>
            <Descriptions.Item label="Orders placed">{user.ordersCount}</Descriptions.Item>
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

export default function AdminUsersPage() {
  const { modal, message } = App.useApp();
  const [users, setUsers] = useState<any[]>(ADMIN_USERS);
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);

  const roleCounts = useMemo(() => {
    const acc: Record<string, number> = { all: users.length, buyer: 0, seller: 0 };
    for (const u of users) acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, [users]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const [start, end] = dateRange || [];
    return users.filter((u) => {
      if (role !== "all" && u.role !== role) return false;
      if (status !== "all" && u.status !== status) return false;
      if (term && !u.name.toLowerCase().includes(term) && !u.email.toLowerCase().includes(term))
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
    setSelected((prev: any) => (prev && prev.id === user.id ? { ...prev, status: nextStatus } : prev));
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

  const roleOptions = [
    { value: "all", label: `All (${roleCounts.all})` },
    { value: "buyer", label: `Buyers (${roleCounts.buyer || 0})` },
    { value: "seller", label: `Sellers (${roleCounts.seller || 0})` },
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
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (role: string) => <RoleTag role={role} />,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: "Activity",
      key: "activity",
      width: 180,
      render: (_: any, user: any) =>
        user.role === "seller" ? (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {user.productsCount} products · {formatPrice(user.totalSales, "INR")}
          </Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {user.ordersCount} orders · {formatPrice(user.totalSpend, "INR")}
          </Text>
        ),
    },
    {
      title: "Joined",
      dataIndex: "joinedAt",
      key: "joinedAt",
      width: 130,
      sorter: (a: any, b: any) => dayjs(a.joinedAt).valueOf() - dayjs(b.joinedAt).valueOf(),
      render: (joinedAt: string) => dayjs(joinedAt).format("DD MMM YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_: any, user: any) => (
        <Space>
          <Button
            type="default"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setSelected(user)}
          >
            View
          </Button>
          {user.status === "active" ? (
            <Button
              type="default"
              size="small"
              danger
              icon={<StopOutlined />}
              onClick={() => handleToggleStatus(user)}
            >
              Deactivate
            </Button>
          ) : (
            <Button
              type="default"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleToggleStatus(user)}
            >
              Activate
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout maxWidth={1440}>
      <Title level={3} style={{ marginTop: 8, marginBottom: 0 }}>
        User Management
      </Title>
      <Text type="secondary">
        View and manage all buyers and sellers on the platform.
      </Text>

      <Card style={{ marginTop: 24 }} styles={{ body: { padding: 16 } }}>
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
          <Col xs={24}>
            <Input
              size="large"
              allowClear
              prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
        </Row>
      </Card>

      <Card style={{ marginTop: 16 }} styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 900 }}
        />
      </Card>

      <ProfileDrawer
        open={Boolean(selected)}
        user={selected}
        onClose={() => setSelected(null)}
        onToggleStatus={handleToggleStatus}
      />
    </AdminLayout>
  );
}
