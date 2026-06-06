import { useEffect, useMemo, useState } from "react";
import {
  App,
  Card,
  Col,
  DatePicker,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Progress,
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
  PictureOutlined,
  EyeOutlined,
  StopOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  ReloadOutlined,
  ExportOutlined,
  PlusOutlined,
  CalendarOutlined,
  LinkOutlined,
  RiseOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui";
import { ADMIN_BANNERS } from "@/utils/dummy";

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const STATUS_META = {
  active: { label: "Live", color: "green" },
  scheduled: { label: "Scheduled", color: "gold" },
  expired: { label: "Expired", color: "default" },
  inactive: { label: "Inactive", color: "red" },
  draft: { label: "Draft", color: "purple" },
};

const PLACEMENT_META = {
  home_top: { label: "Home top" },
  home_middle: { label: "Home middle" },
  category_strip: { label: "Category strip" },
  checkout_top: { label: "Checkout top" },
};

const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

const computeCtr = (impressions, clicks) => {
  if (!impressions || !clicks) return 0;
  return Math.round((clicks / impressions) * 1000) / 10;
};

const StatusTag = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.draft;
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

const BannerFormModal = ({ open, mode, initial, onSubmit, onClose }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (mode === "edit" && initial) {
      form.setFieldsValue({
        ...initial,
        schedule:
          initial.startsAt && initial.endsAt
            ? [dayjs(initial.startsAt), dayjs(initial.endsAt)]
            : null,
      });
    } else {
      form.setFieldsValue({
        title: "",
        subtitle: "",
        image: "",
        placement: "home_top",
        status: "draft",
        priority: 1,
        ctaLabel: "",
        ctaUrl: "",
        schedule: null,
      });
    }
  }, [open, mode, initial, form]);

  return (
    <Modal
      open={open}
      title={mode === "edit" ? "Edit banner" : "Add banner"}
      onCancel={onClose}
      okText={mode === "edit" ? "Save changes" : "Create banner"}
      width={560}
      destroyOnHidden
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            const { schedule, ...rest } = values;
            const [start, end] = schedule || [];
            onSubmit({
              ...rest,
              startsAt: start ? start.toISOString() : null,
              endsAt: end ? end.toISOString() : null,
            });
          })
          .catch(() => {});
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Please enter a title" }]}
        >
          <Input placeholder="e.g. Mega Electronics Sale" />
        </Form.Item>
        <Form.Item label="Subtitle" name="subtitle">
          <Input placeholder="Short tagline shown under the title" />
        </Form.Item>
        <Form.Item
          label="Image URL"
          name="image"
          rules={[{ required: true, message: "Please enter an image URL" }]}
          extra="Recommended 1600 × 500 px"
        >
          <Input placeholder="https://..." />
        </Form.Item>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="Placement" name="placement" initialValue="home_top">
              <Select
                options={Object.entries(PLACEMENT_META).map(([value, m]) => ({
                  value,
                  label: m.label,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Status" name="status" initialValue="draft">
              <Select
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "scheduled", label: "Scheduled" },
                  { value: "active", label: "Live" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="Priority" name="priority" initialValue={1}>
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="CTA label" name="ctaLabel">
              <Input placeholder="Shop now" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="CTA URL" name="ctaUrl">
          <Input placeholder="/buyer/category/electronics" />
        </Form.Item>
        <Form.Item label="Schedule" name="schedule">
          <RangePicker showTime style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const BannerPreviewDrawer = ({ open, banner, onClose, onEdit, onToggleStatus }) => {
  if (!banner) return null;
  const ctr = computeCtr(banner.impressions, banner.clicks);
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={Math.min(560, typeof window !== "undefined" ? window.innerWidth : 560)}
      title="Banner preview"
      destroyOnHidden
    >
      <div style={{ position: "relative", marginBottom: 16 }}>
        <Image
          src={banner.image}
          alt={banner.title}
          width="100%"
          style={{ borderRadius: 12, objectFit: "cover", aspectRatio: "16/5" }}
          fallback="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 60%)",
            borderRadius: 12,
            padding: 24,
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Title level={4} style={{ color: "#fff", margin: 0 }}>
            {banner.title}
          </Title>
          {banner.subtitle && (
            <Paragraph style={{ color: "#fff", marginTop: 6, marginBottom: 12 }}>
              {banner.subtitle}
            </Paragraph>
          )}
          {banner.ctaLabel && (
            <div>
              <Tag color="white" style={{ color: "#1677ff", margin: 0 }}>
                {banner.ctaLabel}
              </Tag>
            </div>
          )}
        </div>
      </div>

      <Space size={8} wrap style={{ marginBottom: 16 }}>
        <StatusTag status={banner.status} />
        <Tag style={{ margin: 0 }}>
          {(PLACEMENT_META[banner.placement] || { label: banner.placement }).label}
        </Tag>
        <Tag color="blue" style={{ margin: 0 }}>
          Priority {banner.priority}
        </Tag>
      </Space>

      <Card styles={{ body: { padding: 16 } }} style={{ marginBottom: 12 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Impressions"
              value={banner.impressions}
              formatter={(v) => formatNumber(v)}
              valueStyle={{ fontSize: 18 }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Clicks"
              value={banner.clicks}
              formatter={(v) => formatNumber(v)}
              valueStyle={{ fontSize: 18 }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="CTR"
              value={ctr}
              suffix="%"
              valueStyle={{ fontSize: 18 }}
            />
          </Col>
        </Row>
      </Card>

      <Card styles={{ body: { padding: 16 } }}>
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <ClockCircleOutlined /> Schedule
            </Text>
            <div>
              {banner.startsAt && banner.endsAt
                ? `${dayjs(banner.startsAt).format("DD MMM YYYY")} → ${dayjs(banner.endsAt).format("DD MMM YYYY")}`
                : "Not scheduled"}
            </div>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <LinkOutlined /> CTA
            </Text>
            <div>
              {banner.ctaLabel ? (
                <Text>
                  {banner.ctaLabel} → <Text code>{banner.ctaUrl || "—"}</Text>
                </Text>
              ) : (
                <Text type="secondary">No CTA configured</Text>
              )}
            </div>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Last updated
            </Text>
            <div>{dayjs(banner.updatedAt).format("DD MMM YYYY, HH:mm")}</div>
          </div>
        </Space>
      </Card>

      <Space direction="vertical" style={{ width: "100%", marginTop: 24 }}>
        <Button type="primary" block icon={<EditOutlined />} onClick={() => onEdit(banner)}>
          Edit banner
        </Button>
        {banner.status === "active" ? (
          <Button danger block icon={<StopOutlined />} onClick={() => onToggleStatus(banner)}>
            Pause banner
          </Button>
        ) : (
          banner.status !== "expired" && (
            <Button block icon={<CheckCircleOutlined />} onClick={() => onToggleStatus(banner)}>
              Activate banner
            </Button>
          )
        )}
      </Space>
    </Drawer>
  );
};

export default function AdminBannerManagementPage() {
  const { modal, message } = App.useApp();
  const [banners, setBanners] = useState(ADMIN_BANNERS);
  const [status, setStatus] = useState("all");
  const [placement, setPlacement] = useState("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [selected, setSelected] = useState(null);
  const [editorMode, setEditorMode] = useState(null);
  const [editing, setEditing] = useState(null);

  const stats = useMemo(() => {
    const acc = {
      total: banners.length,
      active: 0,
      scheduled: 0,
      expired: 0,
      inactive: 0,
      draft: 0,
      impressions: 0,
      clicks: 0,
    };
    for (const b of banners) {
      acc[b.status] = (acc[b.status] || 0) + 1;
      acc.impressions += Number(b.impressions || 0);
      acc.clicks += Number(b.clicks || 0);
    }
    acc.ctr = computeCtr(acc.impressions, acc.clicks);
    return acc;
  }, [banners]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const [start, end] = dateRange || [];
    return banners.filter((b) => {
      if (status !== "all" && b.status !== status) return false;
      if (placement !== "all" && b.placement !== placement) return false;
      if (
        term &&
        !b.title.toLowerCase().includes(term) &&
        !b.id.toLowerCase().includes(term) &&
        !(b.subtitle || "").toLowerCase().includes(term)
      )
        return false;
      if (start && b.startsAt && dayjs(b.startsAt).isBefore(start, "day")) return false;
      if (end && b.endsAt && dayjs(b.endsAt).isAfter(end, "day")) return false;
      return true;
    });
  }, [banners, status, placement, search, dateRange]);

  const updateBanner = (id, patch) => {
    setBanners((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, ...patch, updatedAt: new Date().toISOString() } : b
      )
    );
    setSelected((prev) =>
      prev && prev.id === id ? { ...prev, ...patch, updatedAt: new Date().toISOString() } : prev
    );
  };

  const handleToggleStatus = (banner) => {
    if (banner.status === "active") {
      modal.confirm({
        title: `Pause ${banner.title}?`,
        content: "The banner will be hidden from shoppers immediately.",
        okText: "Pause",
        okButtonProps: { danger: true },
        cancelText: "Cancel",
        onOk: () => {
          updateBanner(banner.id, { status: "inactive" });
          message.success(`${banner.title} paused`);
        },
      });
    } else if (banner.status !== "expired") {
      updateBanner(banner.id, { status: "active" });
      message.success(`${banner.title} is now live`);
    }
  };

  const handleDelete = (banner) => {
    modal.confirm({
      title: `Delete ${banner.title}?`,
      content: "This action cannot be undone.",
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: () => {
        setBanners((prev) => prev.filter((b) => b.id !== banner.id));
        if (selected?.id === banner.id) setSelected(null);
        message.success(`${banner.title} deleted`);
      },
    });
  };

  const handleEdit = (banner) => {
    setEditing(banner);
    setEditorMode("edit");
  };

  const handleCreate = () => {
    setEditing(null);
    setEditorMode("create");
  };

  const handleSubmit = (values) => {
    if (editorMode === "edit" && editing) {
      updateBanner(editing.id, values);
      message.success(`${values.title} updated`);
    } else {
      const nextId = `BNR-${String(
        Math.max(...banners.map((b) => Number(b.id.split("-")[1] || 0))) + 1
      ).padStart(2, "0")}`;
      const newBanner = {
        id: nextId,
        impressions: 0,
        clicks: 0,
        updatedAt: new Date().toISOString(),
        ...values,
      };
      setBanners((prev) => [newBanner, ...prev]);
      message.success(`${values.title} created`);
    }
    setEditorMode(null);
    setEditing(null);
  };

  const handleResetFilters = () => {
    setStatus("all");
    setPlacement("all");
    setSearch("");
    setDateRange(null);
  };

  const statusOptions = [
    { value: "all", label: `All (${stats.total})` },
    { value: "active", label: `Live (${stats.active || 0})` },
    { value: "scheduled", label: `Scheduled (${stats.scheduled || 0})` },
    { value: "draft", label: `Draft (${stats.draft || 0})` },
    { value: "inactive", label: `Inactive (${stats.inactive || 0})` },
    { value: "expired", label: `Expired (${stats.expired || 0})` },
  ];

  const columns = [
    {
      title: "Banner",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (_, banner) => (
        <Space size={12}>
          <Image
            src={banner.image}
            alt={banner.title}
            width={96}
            height={36}
            preview={false}
            style={{ objectFit: "cover", borderRadius: 6 }}
            fallback="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
          />
          <div style={{ minWidth: 0 }}>
            <a onClick={() => setSelected(banner)} style={{ fontWeight: 500 }}>
              {banner.title}
            </a>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {banner.id} · {banner.subtitle || "No subtitle"}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Placement",
      dataIndex: "placement",
      key: "placement",
      width: 150,
      render: (p) => (
        <Tag style={{ margin: 0 }}>{(PLACEMENT_META[p] || { label: p }).label}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (s) => <StatusTag status={s} />,
    },
    {
      title: "Schedule",
      dataIndex: "startsAt",
      key: "schedule",
      width: 220,
      sorter: (a, b) =>
        (a.startsAt ? dayjs(a.startsAt).valueOf() : 0) -
        (b.startsAt ? dayjs(b.startsAt).valueOf() : 0),
      render: (_, banner) =>
        banner.startsAt && banner.endsAt ? (
          <Text style={{ fontSize: 13 }}>
            {dayjs(banner.startsAt).format("DD MMM")} →{" "}
            {dayjs(banner.endsAt).format("DD MMM YYYY")}
          </Text>
        ) : (
          <Text type="secondary">Not scheduled</Text>
        ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 90,
      sorter: (a, b) => a.priority - b.priority,
    },
    {
      title: "Performance",
      key: "performance",
      width: 220,
      render: (_, banner) => {
        const ctr = computeCtr(banner.impressions, banner.clicks);
        if (!banner.impressions) {
          return <Text type="secondary">No data yet</Text>;
        }
        return (
          <Tooltip
            title={`${formatNumber(banner.impressions)} impressions · ${formatNumber(banner.clicks)} clicks`}
          >
            <div style={{ minWidth: 180 }}>
              <Text style={{ fontSize: 12 }}>
                {formatNumber(banner.clicks)} clicks · {ctr}% CTR
              </Text>
              <Progress
                percent={Math.min(ctr * 10, 100)}
                showInfo={false}
                strokeColor="#1677ff"
                size="small"
              />
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 130,
      sorter: (a, b) => dayjs(a.updatedAt).valueOf() - dayjs(b.updatedAt).valueOf(),
      defaultSortOrder: "descend",
      render: (updatedAt) => dayjs(updatedAt).format("DD MMM YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      fixed: "right",
      render: (_, banner) => {
        const menuItems = [
          {
            key: "preview",
            icon: <EyeOutlined />,
            label: "Preview",
            onClick: () => setSelected(banner),
          },
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Edit",
            onClick: () => handleEdit(banner),
          },
          { type: "divider" },
          ...(banner.status === "active"
            ? [
                {
                  key: "pause",
                  icon: <StopOutlined />,
                  label: "Pause",
                  onClick: () => handleToggleStatus(banner),
                },
              ]
            : banner.status !== "expired"
            ? [
                {
                  key: "activate",
                  icon: <CheckCircleOutlined />,
                  label: "Activate",
                  onClick: () => handleToggleStatus(banner),
                },
              ]
            : []),
          { type: "divider" },
          {
            key: "delete",
            icon: <DeleteOutlined />,
            label: "Delete",
            danger: true,
            onClick: () => handleDelete(banner),
          },
        ];
        return (
          <Space>
            <Button
              type="default"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setSelected(banner)}
            >
              Preview
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
            Banner Management
          </Title>
          <Text type="secondary">
            Plan, schedule and monitor every promotional banner on the storefront.
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
              Add banner
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<PictureOutlined />}
            iconBg="#eb2f96"
            title="Total banners"
            value={stats.total}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<CheckCircleOutlined />}
            iconBg="#52c41a"
            title="Live now"
            value={stats.active || 0}
            suffix={
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 6 }}>
                · {stats.scheduled || 0} scheduled
              </Text>
            }
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<RiseOutlined />}
            iconBg="#1677ff"
            title="Total impressions"
            value={stats.impressions}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<LinkOutlined />}
            iconBg="#13c2c2"
            title="Avg. CTR"
            value={stats.ctr || 0}
            suffix="%"
            formatter={(v) => v}
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
          <Col xs={24} sm={12} lg={5}>
            <Select
              size="large"
              value={placement}
              onChange={setPlacement}
              style={{ width: "100%" }}
              options={[
                { value: "all", label: "All placements" },
                ...Object.entries(PLACEMENT_META).map(([value, m]) => ({
                  value,
                  label: m.label,
                })),
              ]}
              suffixIcon={<PictureOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} lg={7}>
            <RangePicker
              size="large"
              style={{ width: "100%" }}
              value={dateRange}
              onChange={setDateRange}
              allowClear
              placeholder={["Starts after", "Ends before"]}
              suffixIcon={<CalendarOutlined />}
            />
          </Col>
          <Col xs={24} md={18}>
            <Input
              size="large"
              allowClear
              prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
              placeholder="Search by title, subtitle or banner ID"
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
            <Text strong>Banners</Text>
            <Tag color="magenta" style={{ margin: 0 }}>
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
            showTotal: (total) => `${formatNumber(total)} banners`,
          }}
          scroll={{ x: 1300 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No banners match these filters"
              />
            ),
          }}
        />
      </Card>

      <BannerPreviewDrawer
        open={Boolean(selected)}
        banner={selected}
        onClose={() => setSelected(null)}
        onEdit={(b) => {
          setSelected(null);
          handleEdit(b);
        }}
        onToggleStatus={handleToggleStatus}
      />

      <BannerFormModal
        open={Boolean(editorMode)}
        mode={editorMode}
        initial={editing}
        onSubmit={handleSubmit}
        onClose={() => {
          setEditorMode(null);
          setEditing(null);
        }}
      />
    </AdminLayout>
  );
}
