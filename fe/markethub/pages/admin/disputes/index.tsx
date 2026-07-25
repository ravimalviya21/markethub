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
  Modal,
  Row,
  Segmented,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from "antd";
import {
  SearchOutlined,
  ExclamationCircleOutlined,
  FireOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  ReloadOutlined,
  ExportOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ShopOutlined,
  ShoppingOutlined,
  DollarOutlined,
  SafetyOutlined,
  SyncOutlined,
  MessageOutlined,
  StopOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui";
import { ADMIN_DISPUTES } from "@/utils/dummy";
import { formatPrice } from "@/utils/customMethods";

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  open: { label: "Open", color: "red", icon: <ExclamationCircleOutlined /> },
  investigating: { label: "Investigating", color: "orange", icon: <SyncOutlined spin /> },
  awaiting_buyer: { label: "Awaiting buyer", color: "gold", icon: <ClockCircleOutlined /> },
  resolved: { label: "Resolved", color: "green", icon: <CheckCircleOutlined /> },
  closed: { label: "Closed", color: "default", icon: <StopOutlined /> },
};

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  urgent: { label: "Urgent", color: "red" },
  high: { label: "High", color: "volcano" },
  medium: { label: "Medium", color: "gold" },
  low: { label: "Low", color: "blue" },
};

const REASON_META: Record<string, string> = {
  item_not_as_described: "Item not as described",
  defective: "Defective product",
  damaged: "Damaged on arrival",
  wrong_item: "Wrong item received",
  refund_pending: "Refund not received",
  delivery: "Late delivery",
  counterfeit: "Counterfeit / fake",
  cancelled_by_seller: "Cancelled by seller",
};

const formatNumber = (value: number | undefined) => Number(value || 0).toLocaleString("en-IN");

const StatusTag = ({ status }: { status: string }) => {
  const meta = STATUS_META[status] || STATUS_META.open;
  return (
    <Tag color={meta.color} icon={meta.icon} style={{ margin: 0 }}>
      {meta.label}
    </Tag>
  );
};

const PriorityTag = ({ priority }: { priority: string }) => {
  const meta = PRIORITY_META[priority] || PRIORITY_META.medium;
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

const TIMELINE_COLOR: Record<string, string> = {
  buyer: "blue",
  seller: "purple",
  admin: "green",
};

interface DisputeDrawerProps {
  open: boolean;
  dispute: any;
  onClose: () => void;
  onStatusChange: (dispute: any, status: string) => void;
  onResolve: (dispute: any, type: "refund" | "compensation" | "rejected") => void;
}

const DisputeDrawer = ({ open, dispute, onClose, onStatusChange, onResolve }: DisputeDrawerProps) => {
  if (!dispute) return null;
  const isOpen = dispute.status === "open" || dispute.status === "investigating" || dispute.status === "awaiting_buyer";
  const daysOpen = dayjs(dispute.updatedAt).diff(dayjs(dispute.openedAt), "day");

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={Math.min(560, typeof window !== "undefined" ? window.innerWidth : 560)}
      title={`Dispute ${dispute.id}`}
      destroyOnHidden
    >
      <Space size={8} wrap style={{ marginBottom: 16 }}>
        <StatusTag status={dispute.status} />
        <PriorityTag priority={dispute.priority} />
        <Tag style={{ margin: 0 }}>
          {REASON_META[dispute.type] || dispute.reason}
        </Tag>
      </Space>

      <Paragraph style={{ marginBottom: 16 }}>{dispute.description}</Paragraph>

      <Descriptions column={1} size="small" colon={false} bordered>
        <Descriptions.Item label={<Space size={6}><ShoppingOutlined />Order</Space>}>
          {dispute.orderId}
        </Descriptions.Item>
        <Descriptions.Item label={<Space size={6}><UserOutlined />Buyer</Space>}>
          <div>{dispute.buyer}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dispute.buyerEmail}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label={<Space size={6}><ShopOutlined />Seller</Space>}>
          {dispute.seller}
        </Descriptions.Item>
        <Descriptions.Item label="Product">{dispute.productName}</Descriptions.Item>
        <Descriptions.Item label={<Space size={6}><DollarOutlined />Amount at stake</Space>}>
          {formatPrice(dispute.amount, "INR")}
        </Descriptions.Item>
        <Descriptions.Item label={<Space size={6}><ClockCircleOutlined />Opened</Space>}>
          {dayjs(dispute.openedAt).format("DD MMM YYYY")} ·{" "}
          {dayjs().diff(dayjs(dispute.openedAt), "day")} days ago
        </Descriptions.Item>
        <Descriptions.Item label="Last activity">
          {dayjs(dispute.updatedAt).format("DD MMM YYYY, HH:mm")} ({daysOpen}d after open)
        </Descriptions.Item>
        <Descriptions.Item label={<Space size={6}><MessageOutlined />Messages</Space>}>
          {dispute.messagesCount}
        </Descriptions.Item>
      </Descriptions>

      {dispute.resolution && (
        <Card
          size="small"
          style={{ marginTop: 16, borderColor: "#b7eb8f", background: "#f6ffed" }}
          styles={{ body: { padding: 12 } }}
        >
          <Space>
            <CheckCircleOutlined style={{ color: "#52c41a" }} />
            <Text strong>Resolution</Text>
            <Tag color="green" style={{ margin: 0 }}>
              {dispute.resolution.type}
            </Tag>
          </Space>
          <div style={{ marginTop: 6 }}>
            <Text>{dispute.resolution.summary}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Decided {dayjs(dispute.resolution.decidedAt).format("DD MMM YYYY")}
          </Text>
        </Card>
      )}

      <Divider titlePlacement="left" style={{ marginTop: 24, fontSize: 14 }}>
        Activity
      </Divider>

      <Timeline
        mode="left"
        items={dispute.timeline.map((entry: any) => ({
          color: TIMELINE_COLOR[entry.role] || "gray",
          label: (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {dayjs(entry.at).format("DD MMM, HH:mm")}
            </Text>
          ),
          children: (
            <div>
              <Text strong>{entry.action}</Text>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {entry.actor} · {entry.role}
                </Text>
              </div>
              {entry.note && (
                <div style={{ marginTop: 4 }}>
                  <Text>{entry.note}</Text>
                </div>
              )}
            </div>
          ),
        }))}
      />

      <Space direction="vertical" style={{ width: "100%", marginTop: 24 }}>
        {isOpen && (
          <>
            <Button
              type="primary"
              block
              icon={<SafetyOutlined />}
              onClick={() => onResolve(dispute, "refund")}
            >
              Resolve · Refund buyer
            </Button>
            <Button
              block
              icon={<DollarOutlined />}
              onClick={() => onResolve(dispute, "compensation")}
            >
              Resolve · Issue store credit
            </Button>
            <Button
              block
              icon={<SyncOutlined />}
              onClick={() => onStatusChange(dispute, "investigating")}
              disabled={dispute.status === "investigating"}
            >
              Mark investigating
            </Button>
            <Button
              block
              icon={<ClockCircleOutlined />}
              onClick={() => onStatusChange(dispute, "awaiting_buyer")}
              disabled={dispute.status === "awaiting_buyer"}
            >
              Await buyer response
            </Button>
            <Button
              danger
              block
              icon={<CloseCircleOutlined />}
              onClick={() => onResolve(dispute, "rejected")}
            >
              Reject claim · Close
            </Button>
          </>
        )}
        {!isOpen && dispute.status !== "closed" && (
          <Button block icon={<StopOutlined />} onClick={() => onStatusChange(dispute, "closed")}>
            Close dispute
          </Button>
        )}
      </Space>
    </Drawer>
  );
};

interface ResolutionModalProps {
  open: boolean;
  dispute: any;
  resolutionType: "refund" | "compensation" | "rejected" | undefined;
  onCancel: () => void;
  onConfirm: (note: string) => void;
}

const ResolutionModal = ({ open, dispute, resolutionType, onCancel, onConfirm }: ResolutionModalProps) => {
  const [note, setNote] = useState("");

  const titles: Record<string, string> = {
    refund: "Issue refund",
    compensation: "Issue store credit",
    rejected: "Reject claim",
  };
  const placeholders: Record<string, string> = {
    refund: "e.g. Full refund issued to original payment method.",
    compensation: "e.g. ₹500 store credit added to wallet.",
    rejected: "e.g. Insufficient evidence after investigation.",
  };

  return (
    <Modal
      open={open}
      title={dispute && resolutionType ? `${titles[resolutionType]} for ${dispute.id}` : ""}
      onCancel={() => {
        setNote("");
        onCancel();
      }}
      okText="Confirm"
      okButtonProps={{ danger: resolutionType === "rejected" }}
      onOk={() => {
        onConfirm(note);
        setNote("");
      }}
      destroyOnHidden
    >
      {dispute && resolutionType && (
        <>
          <Paragraph type="secondary" style={{ marginBottom: 12 }}>
            Order <Text code>{dispute.orderId}</Text> · {dispute.buyer} vs{" "}
            {dispute.seller} · {formatPrice(dispute.amount, "INR")}
          </Paragraph>
          <Text strong>Resolution note</Text>
          <TextArea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={placeholders[resolutionType]}
            style={{ marginTop: 8 }}
          />
        </>
      )}
    </Modal>
  );
};

export default function AdminDisputesPage() {
  const { modal, message } = App.useApp();
  const [disputes, setDisputes] = useState<any[]>(ADMIN_DISPUTES);
  const [status, setStatus] = useState("active");
  const [priority, setPriority] = useState("all");
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);
  const [resolution, setResolution] = useState<{ dispute: any; resolutionType: "refund" | "compensation" | "rejected" } | null>(null);

  const stats = useMemo(() => {
    const acc: Record<string, number> = {
      total: disputes.length,
      open: 0,
      investigating: 0,
      awaiting_buyer: 0,
      resolved: 0,
      closed: 0,
      urgent: 0,
      amountAtStake: 0,
      resolvedThisWeek: 0,
      active: 0,
    };
    const weekStart = dayjs().subtract(7, "day");
    for (const d of disputes) {
      acc[d.status] = (acc[d.status] || 0) + 1;
      if (
        d.priority === "urgent" &&
        d.status !== "resolved" &&
        d.status !== "closed"
      )
        acc.urgent += 1;
      if (d.status !== "resolved" && d.status !== "closed")
        acc.amountAtStake += Number(d.amount || 0);
      if (
        d.status === "resolved" &&
        d.resolution &&
        dayjs(d.resolution.decidedAt).isAfter(weekStart)
      )
        acc.resolvedThisWeek += 1;
    }
    acc.active = acc.open + acc.investigating + acc.awaiting_buyer;
    return acc;
  }, [disputes]);

  const typeOptions = useMemo(() => {
    const set = new Set(disputes.map((d) => d.type));
    return [
      { value: "all", label: "All reasons" },
      ...Array.from(set).map((t) => ({
        value: t,
        label: REASON_META[t] || t,
      })),
    ];
  }, [disputes]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const [start, end] = dateRange || [];
    return disputes.filter((d) => {
      if (status === "active") {
        if (d.status !== "open" && d.status !== "investigating" && d.status !== "awaiting_buyer")
          return false;
      } else if (status !== "all" && d.status !== status) {
        return false;
      }
      if (priority !== "all" && d.priority !== priority) return false;
      if (type !== "all" && d.type !== type) return false;
      if (
        term &&
        !d.id.toLowerCase().includes(term) &&
        !d.orderId.toLowerCase().includes(term) &&
        !d.buyer.toLowerCase().includes(term) &&
        !d.seller.toLowerCase().includes(term)
      )
        return false;
      if (start && dayjs(d.openedAt).isBefore(start, "day")) return false;
      if (end && dayjs(d.openedAt).isAfter(end, "day")) return false;
      return true;
    });
  }, [disputes, status, priority, type, search, dateRange]);

  const updateDispute = (id: string, patch: any) => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, ...patch, updatedAt: new Date().toISOString() }
          : d
      )
    );
    setSelected((prev: any) =>
      prev && prev.id === id
        ? { ...prev, ...patch, updatedAt: new Date().toISOString() }
        : prev
    );
  };

  const appendTimeline = (dispute: any, entry: any) => ({
    timeline: [
      ...dispute.timeline,
      { actor: "Admin", role: "admin", at: new Date().toISOString(), ...entry },
    ],
  });

  const handleStatusChange = (dispute: any, nextStatus: string) => {
    const patch = {
      status: nextStatus,
      ...appendTimeline(dispute, {
        action:
          nextStatus === "investigating"
            ? "Marked investigating"
            : nextStatus === "awaiting_buyer"
            ? "Awaiting buyer response"
            : nextStatus === "closed"
            ? "Closed"
            : `Status → ${nextStatus}`,
      }),
    };
    updateDispute(dispute.id, patch);
    message.success(`${dispute.id} updated`);
  };

  const handleResolve = (dispute: any, resolutionType: "refund" | "compensation" | "rejected") => {
    setResolution({ dispute, resolutionType });
  };

  const handleConfirmResolution = (note: string) => {
    if (!resolution) return;
    const { dispute, resolutionType } = resolution;
    const isReject = resolutionType === "rejected";
    const decidedAt = new Date().toISOString();
    const patch = {
      status: isReject ? "closed" : "resolved",
      resolution: {
        type: resolutionType,
        summary:
          note ||
          (resolutionType === "refund"
            ? `Refund of ${formatPrice(dispute.amount, "INR")} issued.`
            : resolutionType === "compensation"
            ? "Store credit issued."
            : "Claim rejected after review."),
        decidedAt,
      },
      ...appendTimeline(dispute, {
        action: isReject ? "Rejected" : "Resolved",
        note:
          note ||
          (resolutionType === "refund"
            ? "Full refund processed."
            : resolutionType === "compensation"
            ? "Store credit added."
            : "Insufficient evidence."),
        at: decidedAt,
      }),
    };
    updateDispute(dispute.id, patch);
    setResolution(null);
    message.success(`${dispute.id} ${isReject ? "rejected" : "resolved"}`);
  };

  const handleResetFilters = () => {
    setStatus("active");
    setPriority("all");
    setType("all");
    setSearch("");
    setDateRange(null);
  };

  const handleQuickResolve = (dispute: any) => {
    modal.confirm({
      title: `Resolve ${dispute.id} with full refund?`,
      content: `${formatPrice(dispute.amount, "INR")} will be returned to ${dispute.buyer}.`,
      okText: "Refund & resolve",
      cancelText: "Cancel",
      onOk: () => {
        const decidedAt = new Date().toISOString();
        const patch = {
          status: "resolved",
          resolution: {
            type: "refund",
            summary: `Refund of ${formatPrice(dispute.amount, "INR")} issued.`,
            decidedAt,
          },
          ...appendTimeline(dispute, {
            action: "Resolved",
            note: "Quick refund issued.",
            at: decidedAt,
          }),
        };
        updateDispute(dispute.id, patch);
        message.success(`${dispute.id} resolved`);
      },
    });
  };

  const statusOptions = [
    { value: "active", label: `Active (${stats.active})` },
    { value: "open", label: `Open (${stats.open || 0})` },
    { value: "investigating", label: `Investigating (${stats.investigating || 0})` },
    { value: "awaiting_buyer", label: `Awaiting buyer (${stats.awaiting_buyer || 0})` },
    { value: "resolved", label: `Resolved (${stats.resolved || 0})` },
    { value: "closed", label: `Closed (${stats.closed || 0})` },
    { value: "all", label: `All (${stats.total})` },
  ];

  const columns = [
    {
      title: "Dispute",
      dataIndex: "id",
      key: "id",
      sorter: (a: any, b: any) => a.id.localeCompare(b.id),
      render: (id: string, dispute: any) => (
        <Space size={12}>
          <Avatar
            icon={<ExclamationCircleOutlined />}
            style={{
              background:
                dispute.priority === "urgent"
                  ? "#cf1322"
                  : dispute.priority === "high"
                  ? "#fa541c"
                  : "#8c8c8c",
            }}
          />
          <div style={{ minWidth: 0 }}>
            <a onClick={() => setSelected(dispute)} style={{ fontWeight: 500 }}>
              {id}
            </a>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {dispute.orderId} · {dispute.productName}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      width: 180,
      render: (reason: string) => <Text>{reason}</Text>,
    },
    {
      title: "Parties",
      key: "parties",
      width: 220,
      render: (_: any, dispute: any) => (
        <div>
          <Space size={6}>
            <UserOutlined style={{ color: "#1677ff" }} />
            <Text>{dispute.buyer}</Text>
          </Space>
          <div>
            <Space size={6}>
              <ShopOutlined style={{ color: "#722ed1" }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {dispute.seller}
              </Text>
            </Space>
          </div>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 130,
      sorter: (a: any, b: any) => a.amount - b.amount,
      render: (v: number) => <Text strong>{formatPrice(v, "INR")}</Text>,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 110,
      sorter: (a: any, b: any) => {
        const order: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
        return order[a.priority] - order[b.priority];
      },
      render: (p: string) => <PriorityTag priority={p} />,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (s: string) => <StatusTag status={s} />,
    },
    {
      title: "Age",
      dataIndex: "openedAt",
      key: "age",
      width: 110,
      sorter: (a: any, b: any) => dayjs(a.openedAt).valueOf() - dayjs(b.openedAt).valueOf(),
      defaultSortOrder: "ascend" as const,
      render: (openedAt: string, dispute: any) => {
        const days = dayjs().diff(dayjs(openedAt), "day");
        const isActive =
          dispute.status === "open" ||
          dispute.status === "investigating" ||
          dispute.status === "awaiting_buyer";
        const color = !isActive
          ? "default"
          : days >= 14
          ? "red"
          : days >= 7
          ? "orange"
          : "default";
        return (
          <Tooltip title={dayjs(openedAt).format("DD MMM YYYY")}>
            <Tag color={color} style={{ margin: 0 }}>
              {days === 0 ? "Today" : `${days}d`}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      fixed: "right" as const,
      render: (_: any, dispute: any) => {
        const isOpen =
          dispute.status === "open" ||
          dispute.status === "investigating" ||
          dispute.status === "awaiting_buyer";
        const menuItems = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "View details",
            onClick: () => setSelected(dispute),
          },
          ...(isOpen
            ? [
                { type: "divider" as const },
                {
                  key: "investigate",
                  icon: <SyncOutlined />,
                  label: "Mark investigating",
                  disabled: dispute.status === "investigating",
                  onClick: () => handleStatusChange(dispute, "investigating"),
                },
                {
                  key: "await",
                  icon: <ClockCircleOutlined />,
                  label: "Await buyer",
                  disabled: dispute.status === "awaiting_buyer",
                  onClick: () => handleStatusChange(dispute, "awaiting_buyer"),
                },
                { type: "divider" as const },
                {
                  key: "refund",
                  icon: <SafetyOutlined />,
                  label: "Resolve · refund",
                  onClick: () => handleResolve(dispute, "refund"),
                },
                {
                  key: "credit",
                  icon: <DollarOutlined />,
                  label: "Resolve · store credit",
                  onClick: () => handleResolve(dispute, "compensation"),
                },
                {
                  key: "reject",
                  icon: <CloseCircleOutlined />,
                  label: "Reject claim",
                  danger: true,
                  onClick: () => handleResolve(dispute, "rejected"),
                },
              ]
            : dispute.status === "resolved"
            ? [
                { type: "divider" as const },
                {
                  key: "close",
                  icon: <StopOutlined />,
                  label: "Close dispute",
                  onClick: () => handleStatusChange(dispute, "closed"),
                },
              ]
            : []),
        ];
        return (
          <Space>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setSelected(dispute)}
            >
              Review
            </Button>
            {isOpen && (
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleQuickResolve(dispute)}
              >
                Resolve
              </Button>
            )}
            <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
              <Button size="small" icon={<MoreOutlined />} />
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
            Active Disputes
          </Title>
          <Text type="secondary">
            Mediate buyer–seller disputes and protect the marketplace&apos;s trust.
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
            icon={<ExclamationCircleOutlined />}
            iconBg="#cf1322"
            title="Active disputes"
            value={stats.active}
            suffix={
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 6 }}>
                / {stats.total} all-time
              </Text>
            }
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<FireOutlined />}
            iconBg="#fa541c"
            title="Urgent"
            value={stats.urgent}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<DollarOutlined />}
            iconBg="#fa8c16"
            title="Amount at stake"
            value={stats.amountAtStake}
            formatter={(v) => formatPrice(v, "INR")}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<CheckCircleOutlined />}
            iconBg="#52c41a"
            title="Resolved this week"
            value={stats.resolvedThisWeek}
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
              value={priority}
              onChange={setPriority}
              style={{ width: "100%" }}
              options={[
                { value: "all", label: "All priorities" },
                { value: "urgent", label: "Urgent" },
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ]}
              suffixIcon={<FireOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              size="large"
              value={type}
              onChange={setType}
              style={{ width: "100%" }}
              options={typeOptions}
            />
          </Col>
          <Col xs={24} lg={12}>
            <RangePicker
              size="large"
              style={{ width: "100%" }}
              value={dateRange}
              onChange={setDateRange}
              allowClear
              placeholder={["Opened from", "Opened to"]}
            />
          </Col>
          <Col xs={24} md={18}>
            <Input
              size="large"
              allowClear
              prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
              placeholder="Search by dispute ID, order, buyer or seller"
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
            <Text strong>Disputes</Text>
            <Tag color="red" style={{ margin: 0 }}>
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
            showTotal: (total) => `${formatNumber(total)} disputes`,
          }}
          scroll={{ x: 1300 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No disputes match these filters"
              />
            ),
          }}
        />
      </Card>

      <DisputeDrawer
        open={Boolean(selected)}
        dispute={selected}
        onClose={() => setSelected(null)}
        onStatusChange={handleStatusChange}
        onResolve={handleResolve}
      />

      <ResolutionModal
        open={Boolean(resolution)}
        dispute={resolution?.dispute}
        resolutionType={resolution?.resolutionType}
        onCancel={() => setResolution(null)}
        onConfirm={handleConfirmResolution}
      />
    </AppLayout>
  );
}
