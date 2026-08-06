import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Alert,
  App,
  Avatar,
  Card,
  Col,
  Descriptions,
  Drawer,
  Empty,
  Input as AntInput,
  Modal,
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
  MailOutlined,
  TeamOutlined,
  UserAddOutlined,
  ReloadOutlined,
  ExportOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import AppLayout from "@/components/layout/AppLayout";
import { Button, Input } from "@/components/ui";
import {
  CreateUserPayload,
  PlatformUser,
  UserRole,
  useCreateUser,
  useUsers,
} from "@/services/user.service";
import {
  USER_ROLES,
  CreateUserFormOutput,
  CreateUserFormValues,
  createUserSchema,
} from "@/validations/user.validation";
import { getApiErrorMessage } from "@/utils/customMethods";

const { Title, Text } = Typography;

const PAGE_SIZE = 10;

const ROLE_META: Record<UserRole, { label: string; color: string; icon: React.ReactNode }> = {
  buyer: { label: "Buyer", color: "blue", icon: <UserOutlined /> },
  seller: { label: "Seller", color: "purple", icon: <ShopOutlined /> },
  admin: { label: "Admin", color: "gold", icon: <CrownOutlined /> },
};

const EMPTY_FORM: CreateUserFormValues = {
  name: "",
  email: "",
  password: "",
  role: "buyer",
};

const formatNumber = (value: number | undefined) => Number(value || 0).toLocaleString("en-IN");

const RoleTag = ({ role }: { role: UserRole }) => {
  const meta = ROLE_META[role] || ROLE_META.buyer;
  return (
    <Tag color={meta.color} icon={meta.icon} style={{ margin: 0 }}>
      {meta.label}
    </Tag>
  );
};

const VerifiedTag = ({ verified }: { verified: boolean }) => (
  <Tag color={verified ? "green" : "default"} style={{ margin: 0 }}>
    {verified ? "Verified" : "Unverified"}
  </Tag>
);

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: number;
}

const StatCard = ({ icon, iconBg, title, value }: StatCardProps) => (
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
          formatter={(v) => formatNumber(Number(v))}
          styles={{ content: { fontSize: 22, fontWeight: 600, lineHeight: 1.2 } }}
        />
      </div>
    </Space>
  </Card>
);

interface UserDrawerProps {
  user: PlatformUser | null;
  onClose: () => void;
}

const UserDrawer = ({ user, onClose }: UserDrawerProps) => (
  <Drawer
    open={Boolean(user)}
    onClose={onClose}
    size={Math.min(480, typeof window !== "undefined" ? window.innerWidth : 480)}
    title="User profile"
    destroyOnHidden
  >
    {user && (
      <>
        <Space align="center" size={16} style={{ marginBottom: 20 }}>
          <Avatar size={64} icon={<UserOutlined />} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {user.name}
            </Title>
            <Space size={8} wrap style={{ marginTop: 4 }}>
              <RoleTag role={user.role} />
              <VerifiedTag verified={user.isEmailVerified} />
            </Space>
          </div>
        </Space>

        <Descriptions column={1} size="small" colon={false} bordered>
          <Descriptions.Item label="User ID">#{user.id}</Descriptions.Item>
          <Descriptions.Item
            label={
              <Space size={6}>
                <MailOutlined />
                Email
              </Space>
            }
          >
            {user.email}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <Space size={6}>
                <ClockCircleOutlined />
                Joined
              </Space>
            }
          >
            {user.created_at ? dayjs(user.created_at).format("DD MMM YYYY") : "—"}
          </Descriptions.Item>
        </Descriptions>
      </>
    )}
  </Drawer>
);

interface CreateUserModalProps {
  open: boolean;
  submitting: boolean;
  onSubmit: (values: CreateUserFormOutput) => void;
  onClose: () => void;
}

const CreateUserModal = ({ open, submitting, onSubmit, onClose }: CreateUserModalProps) => {
  const { control, handleSubmit, reset } = useForm<
    CreateUserFormValues,
    unknown,
    CreateUserFormOutput
  >({
    resolver: yupResolver(createUserSchema),
    defaultValues: EMPTY_FORM,
    mode: "onTouched",
  });

  useEffect(() => {
    if (open) reset(EMPTY_FORM);
  }, [open, reset]);

  return (
    <Modal
      open={open}
      title="Add user"
      onCancel={onClose}
      okText="Create user"
      onOk={handleSubmit(onSubmit)}
      confirmLoading={submitting}
      destroyOnHidden
      width={520}
    >
      <Input name="name" control={control} label="Name" placeholder="Full name" required />
      <Input
        name="email"
        control={control}
        label="Email"
        type="email"
        placeholder="user@example.com"
        required
      />
      <Input
        name="password"
        control={control}
        label="Temporary password"
        type="password"
        placeholder="At least 8 characters"
        required
      />

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
          <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>Role
        </label>
        <Controller
          name="role"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <>
              <Select
                {...field}
                size="large"
                style={{ width: "100%" }}
                options={USER_ROLES.map((role) => ({
                  value: role,
                  label: ROLE_META[role].label,
                }))}
                status={error ? "error" : ""}
              />
              {error?.message && (
                <div style={{ marginTop: 4, fontSize: 12, color: "#ff4d4f" }}>{error.message}</div>
              )}
            </>
          )}
        />
      </div>

      <Alert
        type="info"
        showIcon
        message="The account is created already verified. Share the password with the user and ask them to change it after signing in."
      />
    </Modal>
  );
};

export default function AdminUserManagementPage() {
  const { message } = App.useApp();
  const [role, setRole] = useState<UserRole | "all">("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PlatformUser | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(role !== "all" ? { role } : {}),
      ...(debouncedSearch ? { q: debouncedSearch } : {}),
    }),
    [page, role, debouncedSearch]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useUsers(params);
  const buyerCount = useUsers({ role: "buyer", limit: 1 }).data?.total ?? 0;
  const sellerCount = useUsers({ role: "seller", limit: 1 }).data?.total ?? 0;
  const adminCount = useUsers({ role: "admin", limit: 1 }).data?.total ?? 0;
  const createUser = useCreateUser();

  const users = data?.items ?? [];
  const total = data?.total ?? 0;

  const handleCreate = async (values: CreateUserFormOutput) => {
    const payload: CreateUserPayload = {
      name: values.name,
      email: values.email,
      password: values.password,
      role: values.role,
    };
    try {
      await createUser.mutateAsync(payload);
      message.success(`${values.name} created`);
      setCreating(false);
    } catch (err) {
      message.error(getApiErrorMessage(err, "Could not create the user"));
    }
  };

  const handleResetFilters = () => {
    setRole("all");
    setSearch("");
    setPage(1);
  };

  const roleOptions = [
    { value: "all", label: `All (${formatNumber(buyerCount + sellerCount + adminCount)})` },
    { value: "buyer", label: `Buyers (${formatNumber(buyerCount)})` },
    { value: "seller", label: `Sellers (${formatNumber(sellerCount)})` },
    { value: "admin", label: `Admins (${formatNumber(adminCount)})` },
  ];

  const columns = [
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      render: (_: unknown, user: PlatformUser) => (
        <Space size={12}>
          <Avatar icon={<UserOutlined />} />
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
      width: 140,
      render: (value: UserRole) => <RoleTag role={value} />,
    },
    {
      title: "Email",
      dataIndex: "isEmailVerified",
      key: "isEmailVerified",
      width: 140,
      render: (verified: boolean) => <VerifiedTag verified={verified} />,
    },
    {
      title: "Joined",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (createdAt?: string) => (createdAt ? dayjs(createdAt).format("DD MMM YYYY") : "—"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: "right" as const,
      render: (_: unknown, user: PlatformUser) => (
        <Button
          type="default"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => setSelected(user)}
        >
          View
        </Button>
      ),
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
            View, filter, and manage all buyers, sellers and admins on the platform.
          </Text>
        </Col>
        <Col>
          <Space>
            <Tooltip title="Refresh">
              <Button
                type="default"
                icon={<ReloadOutlined />}
                loading={isFetching}
                onClick={() => refetch()}
              >
                Refresh
              </Button>
            </Tooltip>
            <Tooltip title="Export to CSV">
              <Button
                type="default"
                icon={<ExportOutlined />}
                onClick={() => message.info("Export coming soon")}
              >
                Export
              </Button>
            </Tooltip>
            <Button type="primary" icon={<UserAddOutlined />} onClick={() => setCreating(true)}>
              Add user
            </Button>
          </Space>
        </Col>
      </Row>

      {isError && (
        <Alert
          type="error"
          showIcon
          style={{ marginTop: 16 }}
          message={getApiErrorMessage(error, "Could not load users")}
          action={
            <Button type="default" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      )}

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<TeamOutlined />}
            iconBg="#1677ff"
            title="Matching users"
            value={total}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard icon={<UserOutlined />} iconBg="#13c2c2" title="Buyers" value={buyerCount} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard icon={<ShopOutlined />} iconBg="#722ed1" title="Sellers" value={sellerCount} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<SafetyCertificateOutlined />}
            iconBg="#faad14"
            title="Admins"
            value={adminCount}
          />
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }} styles={{ body: { padding: 16 } }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} lg={14}>
            <Segmented
              value={role}
              onChange={(value) => {
                setRole(value as UserRole | "all");
                setPage(1);
              }}
              options={roleOptions}
              size="large"
              style={{ maxWidth: "100%", overflowX: "auto" }}
            />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Button size="large" block icon={<ReloadOutlined />} onClick={handleResetFilters}>
              Reset
            </Button>
          </Col>
          <Col xs={24} lg={6}>
            <AntInput
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

      <Card
        style={{ marginTop: 16 }}
        styles={{ body: { padding: 0 } }}
        title={
          <Space>
            <Text strong>Users</Text>
            <Tag color="blue" style={{ margin: 0 }}>
              {formatNumber(total)} total
            </Tag>
          </Space>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={users}
          loading={isLoading}
          onChange={(pagination) => {
            if (pagination.current) setPage(pagination.current);
          }}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total,
            showSizeChanger: false,
            showTotal: (count) => `${formatNumber(count)} users`,
          }}
          scroll={{ x: 900 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  role !== "all" || debouncedSearch
                    ? "No users match these filters"
                    : "No users yet"
                }
              />
            ),
          }}
        />
      </Card>

      <UserDrawer user={selected} onClose={() => setSelected(null)} />

      <CreateUserModal
        open={creating}
        submitting={createUser.isPending}
        onSubmit={handleCreate}
        onClose={() => setCreating(false)}
      />
    </AppLayout>
  );
}
