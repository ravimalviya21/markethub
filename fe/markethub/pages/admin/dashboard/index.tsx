import { useRouter } from "next/router";
import {
  Avatar,
  Card,
  Col,
  List,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import {
  TeamOutlined,
  ShoppingOutlined,
  DollarOutlined,
  AuditOutlined,
  ExclamationCircleOutlined,
  ShopOutlined,
  TagsOutlined,
  UserOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  RightOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  PictureOutlined,
  CalendarOutlined,
  StopOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui";
import {
  ADMIN_CATEGORIES,
  ADMIN_DASHBOARD_STATS,
  ADMIN_PENDING_SELLERS,
  ADMIN_RECENT_BANNERS,
  ADMIN_RECENT_DISPUTES,
  ADMIN_RECENT_ORDERS,
  ADMIN_RECENT_PRODUCTS,
  ADMIN_USERS,
} from "@/utils/dummy";
import { formatPrice } from "@/utils/customMethods";

const ORDER_STATUS_META: Record<string, { color: string; label: string }> = {
  pending: { color: "default", label: "Pending" },
  confirmed: { color: "blue", label: "Confirmed" },
  shipped: { color: "geekblue", label: "Shipped" },
  delivered: { color: "green", label: "Delivered" },
  cancelled: { color: "red", label: "Cancelled" },
  returned: { color: "orange", label: "Returned" },
};

const CATEGORY_STATUS_META: Record<string, { color: string; label: string }> = {
  active: { color: "green", label: "Active" },
  inactive: { color: "default", label: "Inactive" },
};

const BANNER_STATUS_META: Record<string, { color: string; label: string }> = {
  active: { color: "green", label: "Live" },
  scheduled: { color: "gold", label: "Scheduled" },
  expired: { color: "default", label: "Expired" },
};

const { Title, Text, Link } = Typography;

const formatNumber = (value: number | undefined) => Number(value || 0).toLocaleString("en-IN");

const TrendText = ({ value }: { value: number | undefined | null }) => {
  if (value == null) return null;
  const up = value >= 0;
  return (
    <Text
      style={{ fontSize: 12, color: up ? "#3f8600" : "#cf1322" }}
    >
      {up ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(value)}% vs last week
    </Text>
  );
};

interface KpiCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: React.ReactNode;
  footer?: React.ReactNode;
}

const KpiCard = ({ icon, iconBg, title, value, footer }: KpiCardProps) => (
  <Card styles={{ body: { padding: 20 } }} style={{ height: "100%" }}>
    <Space align="start" size={16} style={{ width: "100%" }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: iconBg,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {title}
        </Text>
        <Title level={3} style={{ margin: "2px 0 4px" }}>
          {value}
        </Title>
        {footer}
      </div>
    </Space>
  </Card>
);

export default function AdminDashboardPage() {
  const router = useRouter();
  const stats = ADMIN_DASHBOARD_STATS;
  const revenueCurrency = stats.revenue.currency || "INR";
  const recentUsers = [...ADMIN_USERS]
    .sort((a, b) => dayjs(b.joinedAt).valueOf() - dayjs(a.joinedAt).valueOf())
    .slice(0, 3);
  const recentSellers = ADMIN_USERS.filter((u) => u.role === "seller")
    .sort((a, b) => dayjs(b.joinedAt).valueOf() - dayjs(a.joinedAt).valueOf())
    .slice(0, 3);
  const activeSellers = ADMIN_USERS.filter(
    (u) => u.role === "seller" && u.status === "active"
  ).length;

  return (
    <AppLayout role="admin" maxWidth={1600}>
      <Title level={3} style={{ marginTop: 8, marginBottom: 0 }}>
        Dashboard
      </Title>
      <Text type="secondary">
        Platform health at a glance — {dayjs().format("dddd, DD MMM YYYY")}
      </Text>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} xl={8}>
          <KpiCard
            icon={<TeamOutlined />}
            iconBg="#1677ff"
            title="Total Users"
            value={formatNumber(stats.users.total)}
            footer={
              <Space size={4} wrap>
                <Tag color="blue" style={{ margin: 0 }}>
                  {formatNumber(stats.users.buyers)} buyers
                </Tag>
                <Tag color="purple" style={{ margin: 0 }}>
                  {formatNumber(stats.users.sellers)} sellers
                </Tag>
              </Space>
            }
          />
        </Col>

        <Col xs={24} sm={12} xl={8}>
          <KpiCard
            icon={<ShoppingOutlined />}
            iconBg="#722ed1"
            title="Total Orders"
            value={formatNumber(stats.orders.total)}
            footer={
              <Space direction="vertical" size={2}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {formatNumber(stats.orders.today)} placed today
                </Text>
                <TrendText value={stats.orders.changePct} />
              </Space>
            }
          />
        </Col>

        <Col xs={24} sm={12} xl={8}>
          <KpiCard
            icon={<DollarOutlined />}
            iconBg="#13c2c2"
            title="Total Revenue"
            value={formatPrice(stats.revenue.total, revenueCurrency)}
            footer={
              <Space direction="vertical" size={2}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {formatPrice(stats.revenue.today, revenueCurrency)} today
                </Text>
                <TrendText value={stats.revenue.changePct} />
              </Space>
            }
          />
        </Col>

        <Col xs={24} sm={12} xl={8}>
          <KpiCard
            icon={<ExclamationCircleOutlined />}
            iconBg="#fa541c"
            title="Active Disputes"
            value={formatNumber(stats.disputes.active)}
            footer={
              <Space size={4} wrap>
                <Tag color="red" style={{ margin: 0 }}>
                  {stats.disputes.urgent} urgent
                </Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {stats.disputes.resolvedThisWeek} resolved this week
                </Text>
              </Space>
            }
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12} xl={8}>
          <Card
            title={
              <Space>
                <TeamOutlined />
                <span>User Management</span>
                <Tag color="blue">{formatNumber(stats.users.total)}</Tag>
              </Space>
            }
            extra={
              <Link onClick={() => router.push("/admin/user-management")}>
                View all <RightOutlined style={{ fontSize: 10 }} />
              </Link>
            }
            styles={{ body: { padding: 0 } }}
            style={{ height: "100%" }}
          >
            <Row>
              <Col span={12} style={{ borderRight: "1px solid #f0f0f0", padding: 20 }}>
                <Statistic
                  title="Buyers"
                  value={stats.users.buyers}
                  formatter={(v) => formatNumber(Number(v))}
                  prefix={<UserOutlined style={{ color: "#1677ff" }} />}
                />
              </Col>
              <Col span={12} style={{ padding: 20 }}>
                <Statistic
                  title="Sellers"
                  value={stats.users.sellers}
                  formatter={(v) => formatNumber(Number(v))}
                  prefix={<ShopOutlined style={{ color: "#722ed1" }} />}
                />
              </Col>
            </Row>

            <List
              header={
                <Text strong style={{ paddingLeft: 4 }}>
                  Recently joined
                </Text>
              }
              dataSource={recentUsers}
              style={{ padding: "0 20px 8px" }}
              renderItem={(user) => (
                <List.Item
                  actions={[
                    <Button
                      key="view"
                      type="default"
                      size="small"
                      onClick={() => router.push("/admin/user-management")}
                    >
                      View
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={user.avatar} icon={<UserOutlined />} />}
                    title={user.name}
                    description={
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {user.role === "seller" ? "Seller" : "Buyer"} · joined{" "}
                        {dayjs(user.joinedAt).format("DD MMM")}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12} xl={8}>
          <Card
            title={
              <Space>
                <ShopOutlined />
                <span>Seller Management</span>
                <Tag color="purple">{formatNumber(stats.users.sellers)}</Tag>
              </Space>
            }
            extra={
              <Link onClick={() => router.push("/admin/seller-management")}>
                View all <RightOutlined style={{ fontSize: 10 }} />
              </Link>
            }
            styles={{ body: { padding: 0 } }}
            style={{ height: "100%" }}
          >
            <Row>
              <Col span={12} style={{ borderRight: "1px solid #f0f0f0", padding: 20 }}>
                <Statistic
                  title="Active"
                  value={activeSellers}
                  formatter={(v) => formatNumber(Number(v))}
                  prefix={<ShopOutlined style={{ color: "#722ed1" }} />}
                />
              </Col>
              <Col span={12} style={{ padding: 20 }}>
                <Statistic
                  title="Pending"
                  value={stats.pendingApprovals.sellerRegistrations}
                  formatter={(v) => formatNumber(Number(v))}
                  prefix={<AuditOutlined style={{ color: "#fa8c16" }} />}
                />
              </Col>
            </Row>

            <List
              header={
                <Text strong style={{ paddingLeft: 4 }}>
                  Recently joined
                </Text>
              }
              dataSource={recentSellers}
              style={{ padding: "0 20px 8px" }}
              renderItem={(seller: any) => (
                <List.Item
                  actions={[
                    <Button
                      key="view"
                      type="default"
                      size="small"
                      onClick={() => router.push("/admin/seller-management")}
                    >
                      View
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={seller.avatar} icon={<ShopOutlined />} />}
                    title={seller.businessName || seller.name}
                    description={
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {seller.category || "Seller"} · joined{" "}
                        {dayjs(seller.joinedAt).format("DD MMM")}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12} xl={8}>
          <Card
            title={
              <Space>
                <AppstoreOutlined />
                <span>Product Management</span>
                <Tag color="cyan">{formatNumber(stats.products.total)}</Tag>
              </Space>
            }
            extra={
              <Link onClick={() => router.push("/admin/product-management")}>
                View all <RightOutlined style={{ fontSize: 10 }} />
              </Link>
            }
            styles={{ body: { padding: 0 } }}
            style={{ height: "100%" }}
          >
            <Row>
              <Col span={12} style={{ borderRight: "1px solid #f0f0f0", padding: 20 }}>
                <Statistic
                  title="Active"
                  value={stats.products.active}
                  formatter={(v) => formatNumber(Number(v))}
                  prefix={<AppstoreOutlined style={{ color: "#13c2c2" }} />}
                />
              </Col>
              <Col span={12} style={{ padding: 20 }}>
                <Statistic
                  title="Pending"
                  value={stats.products.pending}
                  formatter={(v) => formatNumber(Number(v))}
                  prefix={<ClockCircleOutlined style={{ color: "#fa8c16" }} />}
                />
              </Col>
            </Row>

            <List
              header={
                <Text strong style={{ paddingLeft: 4 }}>
                  Recently added
                </Text>
              }
              dataSource={ADMIN_RECENT_PRODUCTS}
              style={{ padding: "0 20px 8px" }}
              renderItem={(product) => (
                <List.Item
                  actions={[
                    <Button
                      key="view"
                      type="default"
                      size="small"
                      onClick={() => router.push("/admin/product-management")}
                    >
                      View
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar shape="square" src={product.image} icon={<AppstoreOutlined />} />}
                    title={product.name}
                    description={
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {product.category} · {product.sellerName} ·{" "}
                        {dayjs(product.addedAt).format("DD MMM")}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12} xl={8}>
          <Card
            title={
              <Space>
                <ShoppingOutlined />
                <span>Order Management</span>
                <Tag color="purple">{formatNumber(stats.orders.total)}</Tag>
              </Space>
            }
            extra={
              <Link onClick={() => router.push("/admin/order-management")}>
                View all <RightOutlined style={{ fontSize: 10 }} />
              </Link>
            }
            styles={{ body: { padding: 0 } }}
            style={{ height: "100%" }}
          >
            <Row>
              <Col span={12} style={{ borderRight: "1px solid #f0f0f0", padding: 20 }}>
                <Statistic
                  title="Processing"
                  value={stats.orders.processing}
                  formatter={(v) => formatNumber(Number(v))}
                  prefix={<SyncOutlined style={{ color: "#1677ff" }} />}
                />
              </Col>
              <Col span={12} style={{ padding: 20 }}>
                <Statistic
                  title="Delivered"
                  value={stats.orders.delivered}
                  formatter={(v) => formatNumber(Number(v))}
                  prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                />
              </Col>
            </Row>

            <List
              header={
                <Text strong style={{ paddingLeft: 4 }}>
                  Recent orders
                </Text>
              }
              dataSource={ADMIN_RECENT_ORDERS}
              style={{ padding: "0 20px 8px" }}
              renderItem={(order) => {
                const meta = ORDER_STATUS_META[order.status] || ORDER_STATUS_META.pending;
                return (
                  <List.Item
                    actions={[
                      <Button
                        key="view"
                        type="default"
                        size="small"
                        onClick={() => router.push("/admin/order-management")}
                      >
                        View
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space size={8} wrap>
                          <Text strong>{order.id}</Text>
                          <Tag color={meta.color} style={{ margin: 0 }}>
                            {meta.label}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {order.buyer} · {formatPrice(order.total, "INR")} ·{" "}
                          {dayjs(order.placedAt).format("DD MMM")}
                        </Text>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12} xl={8}>
          <Card
            title={
              <Space>
                <TagsOutlined />
                <span>Category Management</span>
                <Tag color="geekblue">{formatNumber(stats.categories.total)}</Tag>
              </Space>
            }
            extra={
              <Link onClick={() => router.push("/admin/category-management")}>
                View all <RightOutlined style={{ fontSize: 10 }} />
              </Link>
            }
            styles={{ body: { padding: 0 } }}
            style={{ height: "100%" }}
          >
            <Row>
              <Col span={12} style={{ borderRight: "1px solid #f0f0f0", padding: 20 }}>
                <Statistic
                  title="Active"
                  value={stats.categories.active}
                  formatter={(v) => formatNumber(Number(v))}
                  prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                />
              </Col>
              <Col span={12} style={{ padding: 20 }}>
                <Statistic
                  title="Inactive"
                  value={stats.categories.inactive}
                  formatter={(v) => formatNumber(Number(v))}
                  prefix={<StopOutlined style={{ color: "#8c8c8c" }} />}
                />
              </Col>
            </Row>

            <List
              header={
                <Text strong style={{ paddingLeft: 4 }}>
                  Top categories
                </Text>
              }
              dataSource={ADMIN_CATEGORIES}
              style={{ padding: "0 20px 8px" }}
              renderItem={(category) => {
                const meta = CATEGORY_STATUS_META[category.status] || CATEGORY_STATUS_META.active;
                return (
                  <List.Item
                    actions={[
                      <Button
                        key="view"
                        type="default"
                        size="small"
                        onClick={() => router.push("/admin/category-management")}
                      >
                        View
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar shape="square" src={category.image} icon={<TagsOutlined />} />}
                      title={
                        <Space size={8} wrap>
                          <span>{category.name}</span>
                          <Tag color={meta.color} style={{ margin: 0 }}>
                            {meta.label}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatNumber(category.productsCount)} products · updated{" "}
                          {dayjs(category.updatedAt).format("DD MMM")}
                        </Text>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12} xl={8}>
          <Card
            title={
              <Space>
                <PictureOutlined />
                <span>Banner Management</span>
                <Tag color="magenta">{formatNumber(stats.banners.total)}</Tag>
              </Space>
            }
            extra={
              <Link onClick={() => router.push("/admin/banner-management")}>
                View all <RightOutlined style={{ fontSize: 10 }} />
              </Link>
            }
            styles={{ body: { padding: 0 } }}
            style={{ height: "100%" }}
          >
            <Row>
              <Col span={12} style={{ borderRight: "1px solid #f0f0f0", padding: 20 }}>
                <Statistic
                  title="Active"
                  value={stats.banners.active}
                  formatter={(v) => formatNumber(Number(v))}
                  prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                />
              </Col>
              <Col span={12} style={{ padding: 20 }}>
                <Statistic
                  title="Scheduled"
                  value={stats.banners.scheduled}
                  formatter={(v) => formatNumber(Number(v))}
                  prefix={<CalendarOutlined style={{ color: "#faad14" }} />}
                />
              </Col>
            </Row>

            <List
              header={
                <Text strong style={{ paddingLeft: 4 }}>
                  Latest banners
                </Text>
              }
              dataSource={ADMIN_RECENT_BANNERS}
              style={{ padding: "0 20px 8px" }}
              renderItem={(banner) => {
                const meta = BANNER_STATUS_META[banner.status] || BANNER_STATUS_META.active;
                return (
                  <List.Item
                    actions={[
                      <Button
                        key="view"
                        type="default"
                        size="small"
                        onClick={() => router.push("/admin/banner-management")}
                      >
                        View
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar shape="square" src={banner.image} icon={<PictureOutlined />} />}
                      title={
                        <Space size={8} wrap>
                          <span>{banner.title}</span>
                          <Tag color={meta.color} style={{ margin: 0 }}>
                            {meta.label}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {banner.placement} · updated{" "}
                          {dayjs(banner.updatedAt).format("DD MMM")}
                        </Text>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12} xl={8}>
          <Card
            title={
              <Space>
                <AuditOutlined />
                <span>Pending Approvals</span>
                <Tag color="orange">{formatNumber(stats.pendingApprovals.total)}</Tag>
              </Space>
            }
            extra={
              <Link onClick={() => router.push("/admin/approvals")}>
                View all <RightOutlined style={{ fontSize: 10 }} />
              </Link>
            }
            styles={{ body: { padding: 0 } }}
            style={{ height: "100%" }}
          >
            <Row>
              <Col span={12} style={{ borderRight: "1px solid #f0f0f0", padding: 20 }}>
                <Statistic
                  title="Seller registrations"
                  value={stats.pendingApprovals.sellerRegistrations}
                  prefix={<ShopOutlined style={{ color: "#1677ff" }} />}
                />
              </Col>
              <Col span={12} style={{ padding: 20 }}>
                <Statistic
                  title="Product listings"
                  value={stats.pendingApprovals.products}
                  prefix={<TagsOutlined style={{ color: "#722ed1" }} />}
                />
              </Col>
            </Row>

            <List
              header={
                <Text strong style={{ paddingLeft: 4 }}>
                  Latest seller requests
                </Text>
              }
              dataSource={ADMIN_PENDING_SELLERS}
              style={{ padding: "0 20px 8px" }}
              renderItem={(seller) => (
                <List.Item
                  actions={[
                    <Button
                      key="review"
                      type="default"
                      size="small"
                      onClick={() => router.push(`/admin/approvals/${seller.id}`)}
                    >
                      Review
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<ShopOutlined style={{ fontSize: 18, color: "#8c8c8c" }} />}
                    title={seller.name}
                    description={
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {seller.category} · applied{" "}
                        {dayjs(seller.appliedAt).format("DD MMM")}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12} xl={8}>
          <Card
            title={
              <Space>
                <ExclamationCircleOutlined />
                <span>Active Disputes</span>
                <Tag color="red">{formatNumber(stats.disputes.active)}</Tag>
              </Space>
            }
            extra={
              <Link onClick={() => router.push("/admin/disputes")}>
                View all <RightOutlined style={{ fontSize: 10 }} />
              </Link>
            }
            style={{ height: "100%" }}
          >
            <List
              dataSource={ADMIN_RECENT_DISPUTES}
              renderItem={(dispute) => {
                const priorityMeta: Record<string, { color: string; label: string }> = {
                  urgent: { color: "red", label: "Urgent" },
                  high: { color: "volcano", label: "High" },
                  medium: { color: "gold", label: "Medium" },
                  low: { color: "blue", label: "Low" },
                };
                const meta = priorityMeta[dispute.priority] || priorityMeta.medium;
                return (
                  <List.Item
                    actions={[
                      <Button
                        key="resolve"
                        type="default"
                        size="small"
                        onClick={() => router.push(`/admin/disputes/${dispute.id}`)}
                      >
                        Resolve
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space size={8} wrap>
                          <Text strong>{dispute.id}</Text>
                          <Tag color={meta.color} style={{ margin: 0 }}>
                            {meta.label}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dispute.reason} · {dispute.buyer} ·{" "}
                          {dayjs(dispute.openedAt).format("DD MMM")}
                        </Text>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
      </Row>
    </AppLayout>
  );
}
