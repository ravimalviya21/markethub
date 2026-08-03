import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Alert,
  App,
  Avatar,
  Card,
  Col,
  Dropdown,
  Empty,
  Input as AntInput,
  Modal,
  Row,
  Segmented,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  SearchOutlined,
  TagsOutlined,
  StopOutlined,
  CheckCircleOutlined,
  EditOutlined,
  MoreOutlined,
  ReloadOutlined,
  ExportOutlined,
  PlusOutlined,
  AppstoreOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import AppLayout from "@/components/layout/AppLayout";
import { Button, Input } from "@/components/ui";
import {
  Category,
  useCategories,
  useCreateCategory,
  useUpdateCategory,
} from "@/services/category.service";
import {
  CATEGORY_IMAGE_URL_MAX,
  CategoryFormOutput,
  CategoryFormValues,
  categoryFormSchema,
} from "@/validations/category.validation";
import { getApiErrorMessage } from "@/utils/customMethods";

const { Title, Text } = Typography;

const formatNumber = (value: number | undefined) => Number(value || 0).toLocaleString("en-IN");

const EMPTY_FORM: CategoryFormValues = {
  displayName: "",
  parentId: null,
  imageUrl: "",
  isActive: false,
};

const StatusTag = ({ isActive }: { isActive: boolean }) => (
  <Tag color={isActive ? "green" : "default"} style={{ margin: 0 }}>
    {isActive ? "Active" : "Inactive"}
  </Tag>
);

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
          value={value as number}
          formatter={(v) => formatNumber(Number(v))}
          suffix={suffix}
          valueStyle={{ fontSize: 22, fontWeight: 600, lineHeight: 1.2 }}
        />
      </div>
    </Space>
  </Card>
);

interface CategoryFormModalProps {
  open: boolean;
  mode: "create" | "edit" | null;
  initial: Category | null;
  parentOptions: { value: number; label: string }[];
  submitting: boolean;
  onSubmit: (values: CategoryFormOutput) => void;
  onClose: () => void;
}

const CategoryFormModal = ({
  open,
  mode,
  initial,
  parentOptions,
  submitting,
  onSubmit,
  onClose,
}: CategoryFormModalProps) => {
  const isEdit = mode === "edit";
  const { control, handleSubmit, reset } = useForm<CategoryFormValues, unknown, CategoryFormOutput>({
    resolver: yupResolver(categoryFormSchema),
    defaultValues: EMPTY_FORM,
    mode: "onTouched",
  });

  useEffect(() => {
    if (!open) return;
    reset(
      isEdit && initial
        ? {
            displayName: initial.displayName,
            parentId: initial.parentId,
            imageUrl: initial.imageUrl ?? "",
            isActive: initial.isActive,
          }
        : EMPTY_FORM
    );
  }, [open, isEdit, initial, reset]);

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit category" : "Add category"}
      onCancel={onClose}
      okText={isEdit ? "Save changes" : "Create category"}
      onOk={handleSubmit(onSubmit)}
      confirmLoading={submitting}
      destroyOnHidden
      width={520}
    >
      {isEdit && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Parent category and image can only be set when the category is created."
        />
      )}

      <Input
        name="displayName"
        control={control}
        label="Name"
        placeholder="e.g. Electronics"
        required
      />

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
          Parent category
        </label>
        <Controller
          name="parentId"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <>
              <Select
                {...field}
                value={field.value ?? undefined}
                onChange={(value) => field.onChange(value ?? null)}
                allowClear
                disabled={isEdit}
                size="large"
                style={{ width: "100%" }}
                placeholder="None (top level)"
                options={parentOptions}
                showSearch
                optionFilterProp="label"
                status={error ? "error" : ""}
              />
              {error?.message && (
                <div style={{ marginTop: 4, fontSize: 12, color: "#ff4d4f" }}>
                  {error.message}
                </div>
              )}
            </>
          )}
        />
      </div>

      <Input
        name="imageUrl"
        control={control}
        label="Image URL"
        placeholder="https://..."
        disabled={isEdit}
        maxLength={CATEGORY_IMAGE_URL_MAX}
      />

      <Controller
        name="isActive"
        control={control}
        render={({ field }) => (
          <Space size={10}>
            <Switch checked={field.value} onChange={field.onChange} />
            <Text>Visible to buyers</Text>
          </Space>
        )}
      />
    </Modal>
  );
};

export default function AdminCategoryManagementPage() {
  const { modal, message } = App.useApp();
  const [status, setStatus] = useState("all");
  const [level, setLevel] = useState("all");
  const [search, setSearch] = useState("");
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);

  const {
    data: categories = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const stats = useMemo(() => {
    const acc = { total: categories.length, active: 0, inactive: 0, topLevel: 0, sub: 0 };
    for (const c of categories) {
      if (c.isActive) acc.active += 1;
      else acc.inactive += 1;
      if (c.parentId) acc.sub += 1;
      else acc.topLevel += 1;
    }
    return acc;
  }, [categories]);

  const parentMap = useMemo(() => {
    const map = new Map<number, Category>();
    for (const c of categories) map.set(c.id, c);
    return map;
  }, [categories]);

  const parentOptions = useMemo(
    () =>
      categories
        .filter((c) => !c.parentId)
        .map((c) => ({ value: c.id, label: c.displayName })),
    [categories]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return categories.filter((c) => {
      if (status === "active" && !c.isActive) return false;
      if (status === "inactive" && c.isActive) return false;
      if (level === "top" && c.parentId) return false;
      if (level === "sub" && !c.parentId) return false;
      if (
        term &&
        !c.displayName.toLowerCase().includes(term) &&
        !String(c.id).includes(term)
      )
        return false;
      return true;
    });
  }, [categories, status, level, search]);

  const applyStatus = async (category: Category, isActive: boolean) => {
    try {
      await updateCategory.mutateAsync({ id: category.id, isActive });
      message.success(`${category.displayName} ${isActive ? "activated" : "deactivated"}`);
    } catch (err) {
      message.error(getApiErrorMessage(err, "Could not update the category"));
    }
  };

  const handleToggleStatus = (category: Category) => {
    if (category.isActive) {
      modal.confirm({
        title: `Deactivate ${category.displayName}?`,
        content:
          "Buyers will no longer see this category. Existing products remain in place.",
        okText: "Deactivate",
        okButtonProps: { danger: true },
        cancelText: "Cancel",
        onOk: () => applyStatus(category, false),
      });
    } else {
      applyStatus(category, true);
    }
  };

  const handleEdit = (category: Category) => {
    setEditing(category);
    setEditorMode("edit");
  };

  const handleCreate = () => {
    setEditing(null);
    setEditorMode("create");
  };

  const closeEditor = () => {
    setEditorMode(null);
    setEditing(null);
  };

  const handleSubmit = async (values: CategoryFormOutput) => {
    try {
      if (editorMode === "edit" && editing) {
        await updateCategory.mutateAsync({
          id: editing.id,
          displayName: values.displayName,
          isActive: values.isActive,
        });
        message.success(`${values.displayName} updated`);
      } else {
        await createCategory.mutateAsync({
          displayName: values.displayName,
          parentId: values.parentId ?? null,
          imageUrl: values.imageUrl,
          isActive: values.isActive,
        });
        message.success(`${values.displayName} created`);
      }
      closeEditor();
    } catch (err) {
      message.error(getApiErrorMessage(err, "Could not save the category"));
    }
  };

  const handleResetFilters = () => {
    setStatus("all");
    setLevel("all");
    setSearch("");
  };

  const statusOptions = [
    { value: "all", label: `All (${stats.total})` },
    { value: "active", label: `Active (${stats.active})` },
    { value: "inactive", label: `Inactive (${stats.inactive})` },
  ];

  const columns = [
    {
      title: "Category",
      dataIndex: "displayName",
      key: "displayName",
      sorter: (a: Category, b: Category) => a.displayName.localeCompare(b.displayName),
      render: (_: unknown, category: Category) => (
        <Space size={12}>
          <Avatar
            shape="square"
            size={48}
            src={category.imageUrl}
            icon={<TagsOutlined />}
          />
          <div style={{ minWidth: 0 }}>
            <a onClick={() => handleEdit(category)} style={{ fontWeight: 500 }}>
              {category.displayName}
            </a>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                #{category.id}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Parent",
      dataIndex: "parentId",
      key: "parentId",
      width: 180,
      render: (parentId: number | null) =>
        parentId ? (
          <Space size={6}>
            <FolderOutlined style={{ color: "#1677ff" }} />
            <Text>{parentMap.get(parentId)?.displayName || `#${parentId}`}</Text>
          </Space>
        ) : (
          <Tag style={{ margin: 0 }}>Top level</Tag>
        ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 110,
      render: (isActive: boolean) => <StatusTag isActive={isActive} />,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      sorter: (a: Category, b: Category) =>
        dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      render: (createdAt?: string) =>
        createdAt ? dayjs(createdAt).format("DD MMM YYYY") : "—",
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 140,
      sorter: (a: Category, b: Category) =>
        dayjs(a.updatedAt).valueOf() - dayjs(b.updatedAt).valueOf(),
      defaultSortOrder: "descend" as const,
      render: (updatedAt?: string) =>
        updatedAt ? dayjs(updatedAt).format("DD MMM YYYY") : "—",
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      fixed: "right" as const,
      render: (_: unknown, category: Category) => {
        const menuItems = [
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Edit",
            onClick: () => handleEdit(category),
          },
          { type: "divider" as const },
          category.isActive
            ? {
                key: "deactivate",
                icon: <StopOutlined />,
                label: "Deactivate",
                onClick: () => handleToggleStatus(category),
              }
            : {
                key: "activate",
                icon: <CheckCircleOutlined />,
                label: "Activate",
                onClick: () => handleToggleStatus(category),
              },
        ];
        return (
          <Space>
            <Button
              type="default"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(category)}
            >
              Edit
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
            Category Management
          </Title>
          <Text type="secondary">
            Organise the storefront with top-level and sub-categories.
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
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Add category
            </Button>
          </Space>
        </Col>
      </Row>

      {isError && (
        <Alert
          type="error"
          showIcon
          style={{ marginTop: 16 }}
          message={getApiErrorMessage(error, "Could not load categories")}
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
            icon={<TagsOutlined />}
            iconBg="#2f54eb"
            title="Total categories"
            value={stats.total}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<CheckCircleOutlined />}
            iconBg="#52c41a"
            title="Active"
            value={stats.active}
            suffix={
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 6 }}>
                / {stats.inactive} inactive
              </Text>
            }
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<AppstoreOutlined />}
            iconBg="#faad14"
            title="Top level"
            value={stats.topLevel}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<FolderOutlined />}
            iconBg="#13c2c2"
            title="Sub-categories"
            value={stats.sub}
          />
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }} styles={{ body: { padding: 16 } }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} lg={12}>
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
              value={level}
              onChange={setLevel}
              style={{ width: "100%" }}
              options={[
                { value: "all", label: "All levels" },
                { value: "top", label: "Top level only" },
                { value: "sub", label: "Sub-categories" },
              ]}
              suffixIcon={<FolderOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button
              size="large"
              block
              icon={<ReloadOutlined />}
              onClick={handleResetFilters}
            >
              Reset filters
            </Button>
          </Col>
          <Col xs={24}>
            <AntInput
              size="large"
              allowClear
              prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
              placeholder="Search by name or ID"
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
            <Text strong>Categories</Text>
            <Tag color="geekblue" style={{ margin: 0 }}>
              {formatNumber(filtered.length)} shown
            </Tag>
          </Space>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          loading={isLoading}
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
            showTotal: (total) => `${formatNumber(total)} categories`,
          }}
          scroll={{ x: 1100 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  categories.length
                    ? "No categories match these filters"
                    : "No categories yet"
                }
              />
            ),
          }}
        />
      </Card>

      <CategoryFormModal
        open={Boolean(editorMode)}
        mode={editorMode}
        initial={editing}
        parentOptions={parentOptions}
        submitting={createCategory.isPending || updateCategory.isPending}
        onSubmit={handleSubmit}
        onClose={closeEditor}
      />
    </AppLayout>
  );
}
