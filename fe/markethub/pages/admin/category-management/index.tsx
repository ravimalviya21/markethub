import { useEffect, useMemo, useState } from "react";
import {
  App,
  Avatar,
  Card,
  Col,
  Dropdown,
  Empty,
  Form,
  Input,
  InputNumber,
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
  DeleteOutlined,
  StarFilled,
  StarOutlined,
  MoreOutlined,
  ReloadOutlined,
  ExportOutlined,
  PlusOutlined,
  AppstoreOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui";
import { ADMIN_CATEGORIES } from "@/utils/dummy";

const { Title, Text } = Typography;
const { TextArea } = Input;

const STATUS_META: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "green" },
  inactive: { label: "Inactive", color: "default" },
  draft: { label: "Draft", color: "gold" },
};

const formatNumber = (value: number | undefined) => Number(value || 0).toLocaleString("en-IN");

const slugify = (value: string) =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

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

interface CategoryFormModalProps {
  open: boolean;
  mode: "create" | "edit" | null;
  initial: any;
  parentOptions: { value: string; label: string }[];
  onSubmit: (values: any) => void;
  onClose: () => void;
}

const CategoryFormModal = ({ open, mode, initial, parentOptions, onSubmit, onClose }: CategoryFormModalProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (mode === "edit" && initial) {
      form.setFieldsValue(initial);
    } else {
      form.setFieldsValue({
        name: "",
        slug: "",
        description: "",
        parent: null,
        status: "active",
        featured: false,
        sortOrder: 1,
        image: "",
      });
    }
  }, [open, mode, initial, form]);

  return (
    <Modal
      open={open}
      title={mode === "edit" ? "Edit category" : "Add category"}
      onCancel={onClose}
      okText={mode === "edit" ? "Save changes" : "Create category"}
      onOk={() => {
        form
          .validateFields()
          .then((values) => onSubmit({ ...values, slug: values.slug || slugify(values.name) }))
          .catch(() => {});
      }}
      destroyOnHidden
      width={520}
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={(changed, all) => {
          if (mode === "create" && changed.name && !all.slug) {
            form.setFieldValue("slug", slugify(changed.name));
          }
        }}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please enter a name" }]}
        >
          <Input placeholder="e.g. Electronics" />
        </Form.Item>
        <Form.Item
          label="Slug"
          name="slug"
          extra="Used in URLs. Lowercase, no spaces."
        >
          <Input placeholder="auto-generated from name" />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <TextArea rows={3} placeholder="Short description for buyers" />
        </Form.Item>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="Parent category" name="parent">
              <Select
                allowClear
                placeholder="None (top level)"
                options={parentOptions}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Status" name="status" initialValue="active">
              <Select
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                  { value: "draft", label: "Draft" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="Sort order" name="sortOrder" initialValue={1}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Featured"
              name="featured"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Image URL" name="image">
          <Input placeholder="https://..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default function AdminCategoryManagementPage() {
  const { modal, message } = App.useApp();
  const [categories, setCategories] = useState<any[]>(ADMIN_CATEGORIES);
  const [status, setStatus] = useState("all");
  const [level, setLevel] = useState("all");
  const [featured, setFeatured] = useState("all");
  const [search, setSearch] = useState("");
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<any>(null);

  const stats = useMemo(() => {
    const acc: Record<string, number> = {
      total: categories.length,
      active: 0,
      inactive: 0,
      draft: 0,
      featured: 0,
      products: 0,
    };
    for (const c of categories) {
      acc[c.status] = (acc[c.status] || 0) + 1;
      if (c.featured) acc.featured += 1;
      acc.products += Number(c.productsCount || 0);
    }
    return acc;
  }, [categories]);

  const parentMap = useMemo(() => {
    const map = new Map<string, any>();
    for (const c of categories) map.set(c.id, c);
    return map;
  }, [categories]);

  const parentOptions = useMemo(
    () =>
      categories
        .filter((c) => !c.parent)
        .map((c) => ({ value: c.id, label: c.name })),
    [categories]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return categories.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (level === "top" && c.parent) return false;
      if (level === "sub" && !c.parent) return false;
      if (featured === "featured" && !c.featured) return false;
      if (featured === "not_featured" && c.featured) return false;
      if (
        term &&
        !c.name.toLowerCase().includes(term) &&
        !c.slug.toLowerCase().includes(term) &&
        !c.id.toLowerCase().includes(term)
      )
        return false;
      return true;
    });
  }, [categories, status, level, featured, search]);

  const updateCategory = (id: string, patch: any) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...patch, updatedAt: new Date().toISOString() }
          : c
      )
    );
  };

  const handleToggleStatus = (category: any) => {
    if (category.status === "active") {
      modal.confirm({
        title: `Deactivate ${category.name}?`,
        content:
          "Buyers will no longer see this category. Existing products remain in place.",
        okText: "Deactivate",
        okButtonProps: { danger: true },
        cancelText: "Cancel",
        onOk: () => {
          updateCategory(category.id, { status: "inactive" });
          message.success(`${category.name} deactivated`);
        },
      });
    } else {
      updateCategory(category.id, { status: "active" });
      message.success(`${category.name} activated`);
    }
  };

  const handleToggleFeatured = (category: any) => {
    updateCategory(category.id, { featured: !category.featured });
    message.success(
      `${category.name} ${category.featured ? "removed from" : "marked as"} featured`
    );
  };

  const handleDelete = (category: any) => {
    if (category.productsCount > 0) {
      message.warning(
        `${category.name} has ${formatNumber(category.productsCount)} products and cannot be deleted.`
      );
      return;
    }
    modal.confirm({
      title: `Delete ${category.name}?`,
      content: "This action cannot be undone.",
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: () => {
        setCategories((prev) => prev.filter((c) => c.id !== category.id));
        message.success(`${category.name} deleted`);
      },
    });
  };

  const handleEdit = (category: any) => {
    setEditing(category);
    setEditorMode("edit");
  };

  const handleCreate = () => {
    setEditing(null);
    setEditorMode("create");
  };

  const handleSubmit = (values: any) => {
    if (editorMode === "edit" && editing) {
      updateCategory(editing.id, values);
      message.success(`${values.name} updated`);
    } else {
      const nextId = `CAT-${String(
        Math.max(...categories.map((c) => Number(c.id.split("-")[1] || 0))) + 1
      ).padStart(2, "0")}`;
      const newCategory = {
        id: nextId,
        productsCount: 0,
        sellersCount: 0,
        updatedAt: new Date().toISOString(),
        ...values,
      };
      setCategories((prev) => [newCategory, ...prev]);
      message.success(`${values.name} created`);
    }
    setEditorMode(null);
    setEditing(null);
  };

  const handleResetFilters = () => {
    setStatus("all");
    setLevel("all");
    setFeatured("all");
    setSearch("");
  };

  const statusOptions = [
    { value: "all", label: `All (${stats.total})` },
    { value: "active", label: `Active (${stats.active || 0})` },
    { value: "inactive", label: `Inactive (${stats.inactive || 0})` },
    { value: "draft", label: `Draft (${stats.draft || 0})` },
  ];

  const columns = [
    {
      title: "Category",
      dataIndex: "name",
      key: "name",
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      render: (_: any, category: any) => (
        <Space size={12}>
          <Avatar
            shape="square"
            size={48}
            src={category.image}
            icon={<TagsOutlined />}
          />
          <div style={{ minWidth: 0 }}>
            <Space size={6} align="center">
              <a onClick={() => handleEdit(category)} style={{ fontWeight: 500 }}>
                {category.name}
              </a>
              {category.featured && (
                <Tooltip title="Featured">
                  <StarFilled style={{ color: "#faad14", fontSize: 13 }} />
                </Tooltip>
              )}
            </Space>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                /{category.slug} · {category.id}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Parent",
      dataIndex: "parent",
      key: "parent",
      width: 160,
      render: (parentId: string | null) =>
        parentId ? (
          <Space size={6}>
            <FolderOutlined style={{ color: "#1677ff" }} />
            <Text>{parentMap.get(parentId)?.name || "—"}</Text>
          </Space>
        ) : (
          <Tag style={{ margin: 0 }}>Top level</Tag>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
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
      title: "Sellers",
      dataIndex: "sellersCount",
      key: "sellersCount",
      width: 100,
      sorter: (a: any, b: any) => a.sellersCount - b.sellersCount,
      render: (v: number) => formatNumber(v),
    },
    {
      title: "Order",
      dataIndex: "sortOrder",
      key: "sortOrder",
      width: 90,
      sorter: (a: any, b: any) => a.sortOrder - b.sortOrder,
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 130,
      sorter: (a: any, b: any) => dayjs(a.updatedAt).valueOf() - dayjs(b.updatedAt).valueOf(),
      defaultSortOrder: "descend" as const,
      render: (updatedAt: string) => dayjs(updatedAt).format("DD MMM YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      fixed: "right" as const,
      render: (_: any, category: any) => {
        const menuItems = [
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Edit",
            onClick: () => handleEdit(category),
          },
          {
            key: "feature",
            icon: category.featured ? <StarOutlined /> : <StarFilled />,
            label: category.featured ? "Unfeature" : "Mark featured",
            onClick: () => handleToggleFeatured(category),
          },
          { type: "divider" as const },
          category.status === "active"
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
          { type: "divider" as const },
          {
            key: "delete",
            icon: <DeleteOutlined />,
            label: "Delete",
            danger: true,
            disabled: category.productsCount > 0,
            onClick: () => handleDelete(category),
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
    <AdminLayout maxWidth={1440}>
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
            icon={<StarFilled />}
            iconBg="#faad14"
            title="Featured"
            value={stats.featured}
            suffix={
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 6 }}>
                · {stats.draft || 0} drafts
              </Text>
            }
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<AppstoreOutlined />}
            iconBg="#13c2c2"
            title="Products mapped"
            value={stats.products}
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
            <Select
              size="large"
              value={featured}
              onChange={setFeatured}
              style={{ width: "100%" }}
              options={[
                { value: "all", label: "All categories" },
                { value: "featured", label: "Featured only" },
                { value: "not_featured", label: "Not featured" },
              ]}
              suffixIcon={<StarFilled />}
            />
          </Col>
          <Col xs={24} md={18}>
            <Input
              size="large"
              allowClear
              prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
              placeholder="Search by name, slug or ID"
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
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
            showTotal: (total) => `${formatNumber(total)} categories`,
          }}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No categories match these filters"
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
        onSubmit={handleSubmit}
        onClose={() => {
          setEditorMode(null);
          setEditing(null);
        }}
      />
    </AdminLayout>
  );
}
