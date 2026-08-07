import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  App,
  Card,
  Col,
  Empty,
  Input as AntInput,
  Row,
  Segmented,
  Space,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import AppLayout from "@/components/layout/AppLayout";
import { Button, ProductCard } from "@/components/ui";
import { BUYER_WISHLIST } from "@/utils/dummy";

const { Title, Text } = Typography;

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "inStock", label: "In stock" },
  { value: "outOfStock", label: "Out of stock" },
];

export default function BuyerWishlistPage() {
  const router = useRouter();
  const { modal, message } = App.useApp();
  const [items, setItems] = useState(BUYER_WISHLIST);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const acc = { all: items.length, inStock: 0, outOfStock: 0 };
    for (const item of items) {
      if (item.inStock === false) acc.outOfStock += 1;
      else acc.inStock += 1;
    }
    return acc;
  }, [items]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      if (filter === "inStock" && item.inStock === false) return false;
      if (filter === "outOfStock" && item.inStock !== false) return false;
      if (!term) return true;
      return item.title.toLowerCase().includes(term);
    });
  }, [items, filter, search]);

  const handleRemove = (product: any) => {
    setItems((prev) => prev.filter((item) => item.id !== product.id));
    message.success("Removed from wishlist");
  };

  const handleAddToCart = (product: any) => {
    if (product.inStock === false) return;
    message.success(`${product.title} added to cart`);
  };

  const handleClearAll = () => {
    if (!items.length) return;
    modal.confirm({
      title: "Clear your wishlist?",
      content: "All items will be removed. This action can't be undone.",
      okText: "Clear all",
      okButtonProps: { danger: true },
      cancelText: "Keep items",
      onOk: () => {
        setItems([]);
        message.success("Wishlist cleared");
      },
    });
  };

  const handleMoveAllToCart = () => {
    const inStockItems = items.filter((item) => item.inStock !== false);
    if (!inStockItems.length) {
      message.info("No in-stock items to add");
      return;
    }
    message.success(
      `${inStockItems.length} item${inStockItems.length > 1 ? "s" : ""} added to cart`
    );
  };

  const filterOptionsWithCount = FILTER_OPTIONS.map((opt) => ({
    ...opt,
    label: (
      <span>
        {opt.label}
        <span style={{ marginLeft: 6, color: "#8c8c8c" }}>
          {counts[opt.value as keyof typeof counts] || 0}
        </span>
      </span>
    ),
  }));

  return (
    <AppLayout
      role="buyer"
      cartCount={0}
      onCartClick={() => router.push("/account/cart")}
      onSearch={(term) => console.log("search:", term)}
      onChangeLocation={(loc) => console.log("location:", loc)}
    >
        <div>
          <Row
            justify="space-between"
            align="middle"
            gutter={[16, 16]}
            style={{ marginTop: 8 }}
          >
            <Col>
              <Title level={3} style={{ margin: 0 }}>
                My Wishlist
              </Title>
              <Text type="secondary">
                {items.length
                  ? `${items.length} item${items.length > 1 ? "s" : ""} saved for later`
                  : "Save products you love and come back to them anytime."}
              </Text>
            </Col>
            {items.length > 0 && (
              <Col>
                <Space wrap>
                  <Button
                    icon={<ShoppingCartOutlined />}
                    onClick={handleMoveAllToCart}
                  >
                    Move all to cart
                  </Button>
                  <Button
                    type="default"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleClearAll}
                  >
                    Clear all
                  </Button>
                </Space>
              </Col>
            )}
          </Row>

          {items.length > 0 && (
            <Card style={{ marginTop: 24 }} styles={{ body: { padding: 16 } }}>
              <Row gutter={[16, 16]} align="middle" justify="space-between">
                <Col xs={24} md={16}>
                  <Segmented
                    value={filter}
                    onChange={setFilter}
                    options={filterOptionsWithCount}
                    size="large"
                    style={{ maxWidth: "100%", overflowX: "auto" }}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <AntInput
                    size="large"
                    allowClear
                    prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
                    placeholder="Search wishlist"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </Col>
              </Row>
            </Card>
          )}

          <div style={{ marginTop: 24 }}>
            {filtered.length === 0 ? (
              <Card>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    items.length === 0
                      ? "Your wishlist is empty"
                      : search
                        ? "No items match your search"
                        : "No items in this view"
                  }
                >
                  <Button onClick={() => router.push("/buyer/dashboard")}>
                    Continue shopping
                  </Button>
                </Empty>
              </Card>
            ) : (
              <Row gutter={[16, 16]}>
                {filtered.map((product) => (
                  <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                    <div style={{ position: "relative" }}>
                      <ProductCard
                        product={product}
                        wishlisted
                        onClick={(p) => router.push(`/buyer/product/${p.id}`)}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleRemove}
                      />
                      {product.addedAt && (
                        <Text
                          type="secondary"
                          style={{
                            display: "block",
                            fontSize: 12,
                            marginTop: 6,
                            textAlign: "right",
                          }}
                        >
                          Added {dayjs(product.addedAt).format("DD MMM YYYY")}
                        </Text>
                      )}
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </div>
    </AppLayout>
  );
}
