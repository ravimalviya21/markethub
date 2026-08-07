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
  Dropdown,
  Empty,
  Image,
  Input as AntInput,
  InputNumber,
  Modal,
  Rate,
  Row,
  Segmented,
  Select,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  SearchOutlined,
  AppstoreOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShopOutlined,
  MoreOutlined,
  ReloadOutlined,
  ExportOutlined,
  ClockCircleOutlined,
  TagsOutlined,
  InboxOutlined,
  TagOutlined,
  EditOutlined,
  PlusOutlined,
  WarningOutlined,
  InboxOutlined as ArchiveOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import AppLayout from "@/components/layout/AppLayout";
import { Button, ImageUploader, Input } from "@/components/ui";
import { CLOUDINARY_FOLDERS, withCloudinaryTransform } from "@/config/cloudinary";
import { useCategories } from "@/services/category.service";
import {
  CreateProductPayload,
  Product,
  ProductListParams,
  ProductStatus,
  UpdateProductPayload,
  useCreateProduct,
  useProduct,
  useProducts,
  useUpdateProduct,
  useUpdateProductStatus,
} from "@/services/product.service";
import { useSellers } from "@/services/user.service";
import {
  PRODUCT_FORM_STATUSES,
  ProductFormOutput,
  ProductFormValues,
  productFormSchema,
} from "@/validations/product.validation";
import { formatPrice, getApiErrorMessage } from "@/utils/customMethods";

const { Title, Text } = Typography;
const { TextArea } = AntInput;

const PAGE_SIZE = 10;
const LOW_STOCK_THRESHOLD = 10;

const STATUS_META: Record<ProductStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "default" },
  pending: { label: "Pending", color: "gold" },
  approved: { label: "Approved", color: "green" },
  flagged: { label: "Flagged", color: "volcano" },
  rejected: { label: "Rejected", color: "red" },
  archived: { label: "Archived", color: "default" },
};

const SORT_FIELDS: Record<string, ProductListParams["sortBy"]> = {
  name: "name",
  price: "price",
  averageRating: "averageRating",
  createdAt: "createdAt",
};

const EMPTY_FORM: ProductFormValues = {
  name: "",
  sellerId: null,
  status: "pending",
  categoryId: null,
  description: undefined,
  price: 0,
  mrp: null,
  stock: 0,
  imageUrl: undefined,
};

const formatNumber = (value: number | undefined) => Number(value || 0).toLocaleString("en-IN");

const StatusTag = ({ status }: { status: ProductStatus }) => {
  const meta = STATUS_META[status] || STATUS_META.draft;
  return (
    <Tag color={meta.color} style={{ margin: 0 }}>
      {meta.label}
    </Tag>
  );
};

const ProductThumb = ({ url, size = 48 }: { url: string | null; size?: number }) => (
  <Avatar
    shape="square"
    size={size}
    src={url ? withCloudinaryTransform(url, "w_96,h_96,c_fill,f_auto,q_auto") : undefined}
    icon={<AppstoreOutlined />}
    style={url ? undefined : { background: "#f5f5f5", color: "#bfbfbf" }}
  />
);

const StockCell = ({ stock }: { stock: number }) => {
  if (stock === 0) {
    return (
      <Tag color="red" style={{ margin: 0 }}>
        Out
      </Tag>
    );
  }
  if (stock < LOW_STOCK_THRESHOLD) {
    return (
      <Space size={6}>
        <Text>{formatNumber(stock)}</Text>
        <Tag color="orange" style={{ margin: 0 }}>
          Low
        </Tag>
      </Space>
    );
  }
  return <Text>{formatNumber(stock)}</Text>;
};

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: number;
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
          value={value}
          formatter={(v) => formatNumber(Number(v))}
          suffix={suffix}
          styles={{ content: { fontSize: 22, fontWeight: 600, lineHeight: 1.2 } }}
        />
      </div>
    </Space>
  </Card>
);

interface ProductDrawerProps {
  productId: number | null;
  onClose: () => void;
  onStatusChange: (product: Product, status: ProductStatus) => void;
  onEdit: (product: Product) => void;
}

const ProductDrawer = ({ productId, onClose, onStatusChange, onEdit }: ProductDrawerProps) => {
  const { data: product, isLoading, isError, error } = useProduct(productId ?? undefined);

  return (
    <Drawer
      open={Boolean(productId)}
      onClose={onClose}
      size={Math.min(480, typeof window !== "undefined" ? window.innerWidth : 480)}
      title="Product details"
      destroyOnHidden
    >
      {isLoading && <Skeleton active avatar paragraph={{ rows: 8 }} />}

      {isError && (
        <Alert type="error" showIcon message={getApiErrorMessage(error, "Could not load product")} />
      )}

      {product && (
        <>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            {product.images.length ? (
              <Image.PreviewGroup>
                <Space size={8} wrap style={{ justifyContent: "center" }}>
                  {product.images.map((image) => (
                    <Image
                      key={image.id}
                      src={withCloudinaryTransform(image.url, "w_440,h_440,c_fill,f_auto,q_auto")}
                      alt={image.altText || product.name}
                      width={product.images.length > 1 ? 104 : 220}
                      height={product.images.length > 1 ? 104 : 220}
                      style={{ borderRadius: 12, objectFit: "cover" }}
                    />
                  ))}
                </Space>
              </Image.PreviewGroup>
            ) : (
              <ProductThumb url={null} size={140} />
            )}
          </div>

          <Title level={4} style={{ margin: 0 }}>
            {product.name}
          </Title>
          <Space size={8} wrap style={{ marginTop: 8, marginBottom: 16 }}>
            <StatusTag status={product.status} />
            {product.categoryName && (
              <Tag color="cyan" style={{ margin: 0 }}>
                {product.categoryName}
              </Tag>
            )}
          </Space>

          {product.description && (
            <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
              {product.description}
            </Text>
          )}

          <Descriptions column={1} size="small" colon={false} bordered>
            <Descriptions.Item label="Product ID">#{product.id}</Descriptions.Item>
            <Descriptions.Item label="Slug">{product.slug}</Descriptions.Item>
            <Descriptions.Item
              label={
                <Space size={6}>
                  <ShopOutlined />
                  Seller
                </Space>
              }
            >
              {product.sellerName || `#${product.sellerId}`}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <Space size={6}>
                  <TagOutlined />
                  Price
                </Space>
              }
            >
              <Text strong>{formatPrice(product.price, "INR")}</Text>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <Space size={6}>
                  <InboxOutlined />
                  Stock
                </Space>
              }
            >
              <StockCell stock={product.stock} />
            </Descriptions.Item>
            <Descriptions.Item label="Rating">
              {product.reviewsCount ? (
                <Space size={6}>
                  <Rate disabled allowHalf value={product.averageRating} style={{ fontSize: 14 }} />
                  <Text type="secondary">
                    {product.averageRating.toFixed(1)} · {formatNumber(product.reviewsCount)} reviews
                  </Text>
                </Space>
              ) : (
                "—"
              )}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <Space size={6}>
                  <ClockCircleOutlined />
                  Added
                </Space>
              }
            >
              {product.createdAt ? dayjs(product.createdAt).format("DD MMM YYYY") : "—"}
            </Descriptions.Item>
          </Descriptions>

          <Space direction="vertical" style={{ width: "100%", marginTop: 24 }}>
            <Button block icon={<EditOutlined />} onClick={() => onEdit(product)}>
              Edit product
            </Button>
            {product.status !== "approved" && (
              <Button
                type="primary"
                block
                icon={<CheckCircleOutlined />}
                onClick={() => onStatusChange(product, "approved")}
              >
                Approve listing
              </Button>
            )}
            {product.status !== "rejected" && (
              <Button
                danger
                block
                icon={<CloseCircleOutlined />}
                onClick={() => onStatusChange(product, "rejected")}
              >
                Reject listing
              </Button>
            )}
            {product.status !== "flagged" && (
              <Button
                block
                icon={<WarningOutlined />}
                onClick={() => onStatusChange(product, "flagged")}
              >
                Flag for review
              </Button>
            )}
            {product.status !== "archived" && (
              <Button
                block
                icon={<ArchiveOutlined />}
                onClick={() => onStatusChange(product, "archived")}
              >
                Archive
              </Button>
            )}
          </Space>
        </>
      )}
    </Drawer>
  );
};

interface ProductFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  product: Product | null;
  categoryOptions: { value: number; label: string }[];
  sellerOptions: { value: number; label: string }[];
  sellersLoading: boolean;
  submitting: boolean;
  onSubmit: (values: ProductFormOutput) => void;
  onClose: () => void;
}

const ProductFormModal = ({
  open,
  mode,
  product,
  categoryOptions,
  sellerOptions,
  sellersLoading,
  submitting,
  onSubmit,
  onClose,
}: ProductFormModalProps) => {
  const isCreate = mode === "create";
  const [uploading, setUploading] = useState(false);
  const { control, handleSubmit, reset } = useForm<ProductFormValues, unknown, ProductFormOutput>({
    resolver: yupResolver(productFormSchema),
    defaultValues: EMPTY_FORM,
    context: { mode },
    mode: "onTouched",
  });

  useEffect(() => {
    if (!open) return;
    reset(
      product
        ? {
            name: product.name,
            sellerId: product.sellerId,
            status: "pending",
            categoryId: product.categoryId,
            description: product.description ?? undefined,
            price: product.price,
            mrp: product.mrp,
            stock: product.stock,
            imageUrl: product.primaryImageUrl ?? undefined,
          }
        : EMPTY_FORM
    );
  }, [open, product, reset]);

  return (
    <Modal
      open={open}
      title={isCreate ? "Add product" : "Edit product"}
      onCancel={onClose}
      okText={isCreate ? "Create product" : "Save changes"}
      onOk={handleSubmit(onSubmit)}
      confirmLoading={submitting}
      okButtonProps={{ disabled: uploading }}
      destroyOnHidden
      width={560}
    >
      <Input name="name" control={control} label="Name" placeholder="Product name" required />

      {isCreate && (
        <Row gutter={12}>
          <Col span={14}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
                <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>Seller
              </label>
              <Controller
                name="sellerId"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <Select
                      {...field}
                      value={field.value ?? undefined}
                      onChange={(value) => field.onChange(value ?? null)}
                      allowClear
                      size="large"
                      style={{ width: "100%" }}
                      placeholder={sellersLoading ? "Loading sellers…" : "Select a seller"}
                      loading={sellersLoading}
                      options={sellerOptions}
                      showSearch
                      optionFilterProp="label"
                      status={error ? "error" : ""}
                      notFoundContent={sellersLoading ? "Loading…" : "No sellers found"}
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
          </Col>
          <Col span={10}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>Status</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    size="large"
                    style={{ width: "100%" }}
                    options={PRODUCT_FORM_STATUSES.map((value) => ({
                      value,
                      label: STATUS_META[value].label,
                    }))}
                  />
                )}
              />
            </div>
          </Col>
        </Row>
      )}

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>Category</label>
        <Controller
          name="categoryId"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <>
              <Select
                {...field}
                value={field.value ?? undefined}
                onChange={(value) => field.onChange(value ?? null)}
                allowClear
                size="large"
                style={{ width: "100%" }}
                placeholder="Uncategorised"
                options={categoryOptions}
                showSearch
                optionFilterProp="label"
                status={error ? "error" : ""}
              />
              {error?.message && (
                <div style={{ marginTop: 4, fontSize: 12, color: "#ff4d4f" }}>{error.message}</div>
              )}
            </>
          )}
        />
      </div>

      <Row gutter={12}>
        <Col span={8}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
              <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>Price
            </label>
            <Controller
              name="price"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <InputNumber
                    {...field}
                    size="large"
                    style={{ width: "100%" }}
                    min={0}
                    precision={2}
                    prefix="₹"
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
        </Col>
        <Col span={8}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
              MRP{" "}
              <Text type="secondary" style={{ fontSize: 12 }}>
                (drives the discount badge)
              </Text>
            </label>
            <Controller
              name="mrp"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <InputNumber
                    {...field}
                    value={field.value ?? undefined}
                    onChange={(value) => field.onChange(value ?? null)}
                    size="large"
                    style={{ width: "100%" }}
                    min={0}
                    precision={2}
                    prefix="₹"
                    placeholder="Optional"
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
        </Col>
        <Col span={8}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
              <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>Stock
            </label>
            <Controller
              name="stock"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <InputNumber
                    {...field}
                    size="large"
                    style={{ width: "100%" }}
                    min={0}
                    precision={0}
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
        </Col>
      </Row>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>Description</label>
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <>
              <TextArea
                {...field}
                value={field.value ?? ""}
                rows={3}
                placeholder="What buyers should know about this product"
                status={error ? "error" : ""}
              />
              {error?.message && (
                <div style={{ marginTop: 4, fontSize: 12, color: "#ff4d4f" }}>{error.message}</div>
              )}
            </>
          )}
        />
      </div>

      <Controller
        name="imageUrl"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <ImageUploader
            value={field.value}
            onChange={(url) => field.onChange(url ?? "")}
            label="Primary image (optional)"
            error={error?.message}
            folder={CLOUDINARY_FOLDERS.PRODUCTS}
            placeholderIcon={<AppstoreOutlined />}
            onUploadingChange={setUploading}
            helperText="Replaces the product's image gallery."
          />
        )}
      />
    </Modal>
  );
};

export default function AdminProductManagementPage() {
  const { modal, message } = App.useApp();
  const [status, setStatus] = useState<ProductStatus | "all">("all");
  const [categoryId, setCategoryId] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<ProductListParams["sortBy"]>("createdAt");
  const [sortOrder, setSortOrder] = useState<ProductListParams["sortOrder"]>("desc");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const params = useMemo<ProductListParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      sortBy,
      sortOrder,
      ...(status !== "all" ? { status } : {}),
      ...(categoryId !== "all" ? { categoryId } : {}),
      ...(debouncedSearch ? { q: debouncedSearch } : {}),
    }),
    [page, sortBy, sortOrder, status, categoryId, debouncedSearch]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useProducts(params);
  const { data: categories = [] } = useCategories();
  const pendingCount = useProducts({ status: "pending", limit: 1 }).data?.total ?? 0;
  const approvedCount = useProducts({ status: "approved", limit: 1 }).data?.total ?? 0;
  const flaggedCount = useProducts({ status: "flagged", limit: 1 }).data?.total ?? 0;

  const { data: sellerData, isLoading: sellersLoading } = useSellers();
  const updateStatus = useUpdateProductStatus();
  const updateProduct = useUpdateProduct();
  const createProduct = useCreateProduct();

  const products = data?.items ?? [];
  const total = data?.total ?? 0;

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.displayName })),
    [categories]
  );

  const sellerOptions = useMemo(
    () => (sellerData?.items ?? []).map((seller) => ({ value: seller.id, label: seller.name })),
    [sellerData]
  );

  const openCreate = () => {
    setEditing(null);
    setEditorMode("create");
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setEditorMode("edit");
  };

  const closeEditor = () => {
    setEditorMode(null);
    setEditing(null);
  };

  const applyStatus = async (product: Product, nextStatus: ProductStatus) => {
    try {
      await updateStatus.mutateAsync({ id: product.id, status: nextStatus });
      message.success(`${product.name} marked ${STATUS_META[nextStatus].label.toLowerCase()}`);
    } catch (err) {
      message.error(getApiErrorMessage(err, "Could not update the product"));
    }
  };

  const handleStatusChange = (product: Product, nextStatus: ProductStatus) => {
    if (nextStatus === "approved") {
      applyStatus(product, nextStatus);
      return;
    }
    const copy: Record<string, { title: string; content: string; okText: string }> = {
      rejected: {
        title: `Reject ${product.name}?`,
        content: "The listing will be hidden from buyers and marked as rejected.",
        okText: "Reject",
      },
      flagged: {
        title: `Flag ${product.name}?`,
        content: "The listing will be hidden from buyers pending a closer look.",
        okText: "Flag",
      },
      archived: {
        title: `Archive ${product.name}?`,
        content: "The listing will be removed from the storefront. It can be restored later.",
        okText: "Archive",
      },
    };
    const text = copy[nextStatus];
    if (!text) {
      applyStatus(product, nextStatus);
      return;
    }
    modal.confirm({
      ...text,
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: () => applyStatus(product, nextStatus),
    });
  };

  const handleFormSubmit = async (values: ProductFormOutput) => {
    try {
      if (editorMode === "create") {
        const payload: CreateProductPayload = {
          name: values.name,
          sellerId: values.sellerId ?? undefined,
          categoryId: values.categoryId,
          description: values.description,
          price: values.price,
          mrp: values.mrp,
          stock: values.stock,
          status: values.status,
          ...(values.imageUrl ? { images: [{ url: values.imageUrl, sortOrder: 0 }] } : {}),
        };
        await createProduct.mutateAsync(payload);
        message.success(`${values.name} created`);
      } else if (editing) {
        const payload: UpdateProductPayload = {
          id: editing.id,
          name: values.name,
          categoryId: values.categoryId,
          description: values.description,
          price: values.price,
          mrp: values.mrp,
          stock: values.stock,
        };
        if ((values.imageUrl ?? "") !== (editing.primaryImageUrl ?? "")) {
          payload.images = values.imageUrl ? [{ url: values.imageUrl, sortOrder: 0 }] : [];
        }
        await updateProduct.mutateAsync(payload);
        message.success(`${values.name} updated`);
      }
      closeEditor();
    } catch (err) {
      message.error(getApiErrorMessage(err, "Could not save the product"));
    }
  };

  const handleResetFilters = () => {
    setStatus("all");
    setCategoryId("all");
    setSearch("");
    setPage(1);
  };

  const statusOptions = [
    { value: "all", label: "All" },
    ...(Object.keys(STATUS_META) as ProductStatus[]).map((key) => ({
      value: key,
      label: STATUS_META[key].label,
    })),
  ];

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (_: unknown, product: Product) => (
        <Space size={12}>
          <ProductThumb url={product.primaryImageUrl} />
          <div style={{ minWidth: 0 }}>
            <a onClick={() => setSelectedId(product.id)} style={{ fontWeight: 500 }}>
              {product.name}
            </a>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                #{product.id} · {product.categoryName || "Uncategorised"}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Seller",
      dataIndex: "sellerName",
      key: "sellerName",
      width: 180,
      render: (sellerName: string | null, product: Product) => (
        <Space size={6}>
          <ShopOutlined style={{ color: "#722ed1" }} />
          <Text>{sellerName || `#${product.sellerId}`}</Text>
        </Space>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 130,
      sorter: true,
      render: (price: number) => <Text strong>{formatPrice(price, "INR")}</Text>,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      width: 120,
      render: (stock: number) => <StockCell stock={stock} />,
    },
    {
      title: "Rating",
      dataIndex: "averageRating",
      key: "averageRating",
      width: 110,
      sorter: true,
      render: (rating: number, product: Product) =>
        product.reviewsCount ? (
          <Tooltip title={`${formatNumber(product.reviewsCount)} reviews`}>
            <Text>{rating.toFixed(1)} ★</Text>
          </Tooltip>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (s: ProductStatus) => <StatusTag status={s} />,
    },
    {
      title: "Added",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      sorter: true,
      defaultSortOrder: "descend" as const,
      render: (createdAt?: string) => (createdAt ? dayjs(createdAt).format("DD MMM YYYY") : "—"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      fixed: "right" as const,
      render: (_: unknown, product: Product) => {
        const menuItems = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "View details",
            onClick: () => setSelectedId(product.id),
          },
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Edit",
            onClick: () => openEdit(product),
          },
          { type: "divider" as const },
          ...(product.status !== "approved"
            ? [
                {
                  key: "approve",
                  icon: <CheckCircleOutlined />,
                  label: "Approve",
                  onClick: () => handleStatusChange(product, "approved"),
                },
              ]
            : []),
          ...(product.status !== "rejected"
            ? [
                {
                  key: "reject",
                  icon: <CloseCircleOutlined />,
                  label: "Reject",
                  danger: true,
                  onClick: () => handleStatusChange(product, "rejected"),
                },
              ]
            : []),
          ...(product.status !== "flagged"
            ? [
                {
                  key: "flag",
                  icon: <WarningOutlined />,
                  label: "Flag",
                  onClick: () => handleStatusChange(product, "flagged"),
                },
              ]
            : []),
          ...(product.status !== "archived"
            ? [
                {
                  key: "archive",
                  icon: <ArchiveOutlined />,
                  label: "Archive",
                  onClick: () => handleStatusChange(product, "archived"),
                },
              ]
            : []),
        ];
        return (
          <Space>
            <Button
              type="default"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setSelectedId(product.id)}
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
            Product Management
          </Title>
          <Text type="secondary">
            Approve listings, monitor stock, and manage every product on the platform.
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
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Add product
            </Button>
          </Space>
        </Col>
      </Row>

      {isError && (
        <Alert
          type="error"
          showIcon
          style={{ marginTop: 16 }}
          message={getApiErrorMessage(error, "Could not load products")}
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
            icon={<AppstoreOutlined />}
            iconBg="#13c2c2"
            title="Matching products"
            value={total}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<ClockCircleOutlined />}
            iconBg="#fa8c16"
            title="Pending review"
            value={pendingCount}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<CheckCircleOutlined />}
            iconBg="#52c41a"
            title="Approved"
            value={approvedCount}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            icon={<WarningOutlined />}
            iconBg="#fa541c"
            title="Flagged"
            value={flaggedCount}
          />
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }} styles={{ body: { padding: 16 } }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} lg={14}>
            <Segmented
              value={status}
              onChange={(value) => {
                setStatus(value as ProductStatus | "all");
                setPage(1);
              }}
              options={statusOptions}
              size="large"
              style={{ maxWidth: "100%", overflowX: "auto" }}
            />
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Select
              size="large"
              value={categoryId}
              onChange={(value) => {
                setCategoryId(value);
                setPage(1);
              }}
              style={{ width: "100%" }}
              options={[{ value: "all", label: "All categories" }, ...categoryOptions]}
              suffixIcon={<TagsOutlined />}
              showSearch
              optionFilterProp="label"
            />
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Button size="large" block icon={<ReloadOutlined />} onClick={handleResetFilters}>
              Reset filters
            </Button>
          </Col>
          <Col xs={24}>
            <AntInput
              size="large"
              allowClear
              prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
              placeholder="Search by product name or description"
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
            <Text strong>Products</Text>
            <Tag color="cyan" style={{ margin: 0 }}>
              {formatNumber(total)} total
            </Tag>
          </Space>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={products}
          loading={isLoading}
          onChange={(pagination, _filters, sorter) => {
            if (pagination.current) setPage(pagination.current);
            const active = Array.isArray(sorter) ? sorter[0] : sorter;
            const field = typeof active?.field === "string" ? active.field : undefined;
            if (field && active?.order) {
              setSortBy(SORT_FIELDS[field] ?? "createdAt");
              setSortOrder(active.order === "ascend" ? "asc" : "desc");
            } else {
              setSortBy("createdAt");
              setSortOrder("desc");
            }
          }}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total,
            showSizeChanger: false,
            showTotal: (count) => `${formatNumber(count)} products`,
          }}
          scroll={{ x: 1300 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  status !== "all" || categoryId !== "all" || debouncedSearch
                    ? "No products match these filters"
                    : "No products yet"
                }
              />
            ),
          }}
        />
      </Card>

      <ProductDrawer
        productId={selectedId}
        onClose={() => setSelectedId(null)}
        onStatusChange={handleStatusChange}
        onEdit={(product) => {
          setSelectedId(null);
          openEdit(product);
        }}
      />

      <ProductFormModal
        open={Boolean(editorMode)}
        mode={editorMode === "create" ? "create" : "edit"}
        product={editing}
        categoryOptions={categoryOptions}
        sellerOptions={sellerOptions}
        sellersLoading={sellersLoading}
        submitting={createProduct.isPending || updateProduct.isPending}
        onSubmit={handleFormSubmit}
        onClose={closeEditor}
      />
    </AppLayout>
  );
}
