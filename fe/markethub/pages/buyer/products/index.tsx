import { CSSProperties, useEffect, useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { App, Col, Pagination, Row, Typography } from "antd";

import AppLayout from "@/components/layout/AppLayout";
import { Breadcrumbs, ProductFilter, ProductGrid } from "@/components/ui";
import { Crumb, categoryCrumbs } from "@/components/ui/Breadcrumbs";
import { ProductFilterPatch } from "@/components/ui/ProductFilter";
import { useCategories } from "@/services/category.service";
import { Product, useProductFeed, useProducts } from "@/services/product.service";
import {
  DEFAULT_PRODUCT_SORT,
  PRODUCT_GRID_COLUMNS,
  PRODUCT_PAGE_SIZE,
  PRODUCT_SORT_MAP,
  ProductSortValue,
} from "@/contants/product";
import { STICKY_PANEL_BOTTOM_GAP, STICKY_TOP_OFFSET, WIDE_CONTENT_MAX_WIDTH } from "@/contants/layout";
import { getCategoryPath } from "@/utils/category";
import {
  ProductFilters,
  buildFeedParams,
  buildListParams,
  filterProducts,
  getListingCopy,
} from "@/utils/product";
import { firstValue, paginate, toPositiveInt, toPrice } from "@/utils/customMethods";

const { Title, Text } = Typography;

const stickyFilterStyle: CSSProperties = { position: "sticky", top: STICKY_TOP_OFFSET };

const filterBodyStyle: CSSProperties = {
  padding: 16,
  maxHeight: `calc(100vh - ${STICKY_TOP_OFFSET + STICKY_PANEL_BOTTOM_GAP}px)`,
  overflowY: "auto",
};

export default function BuyerProductsPage() {
  const router = useRouter();
  const { message } = App.useApp();

  const rawSort = firstValue(router.query.sort);
  const sort = (rawSort && PRODUCT_SORT_MAP[rawSort] ? rawSort : DEFAULT_PRODUCT_SORT) as ProductSortValue;
  const sortConfig = PRODUCT_SORT_MAP[sort];
  const page = toPositiveInt(firstValue(router.query.page)) ?? 1;

  const filters: ProductFilters = {
    search: (firstValue(router.query.q) ?? "").trim(),
    categoryId: toPositiveInt(firstValue(router.query.categoryId)),
    minPrice: toPrice(firstValue(router.query.minPrice)),
    maxPrice: toPrice(firstValue(router.query.maxPrice)),
  };
  const { search = "", categoryId, minPrice, maxPrice } = filters;

  const applyQuery = (
    patch: Record<string, string | number | undefined>,
    { keepPage = false } = {}
  ) => {
    const next: Record<string, string | number | string[] | undefined> = {
      ...router.query,
      ...patch,
    };
    if (!keepPage) delete next.page;
    Object.keys(next).forEach((key) => {
      const value = next[key];
      if (value === undefined || value === "") delete next[key];
    });
    router.replace({ pathname: "/buyer/products", query: next }, undefined, { shallow: true });
  };

  const isCurated = Boolean(sortConfig.feedType);

  const feedParams = useMemo(
    () => buildFeedParams(sortConfig, categoryId),
    [sortConfig, categoryId]
  );

  const listParams = useMemo(
    () => buildListParams(sortConfig, page, { search, categoryId, minPrice, maxPrice }),
    [sortConfig, page, search, categoryId, minPrice, maxPrice]
  );

  const feed = useProductFeed(feedParams, { enabled: router.isReady && isCurated });
  const list = useProducts(listParams, { enabled: router.isReady && !isCurated });

  const curatedMatches = useMemo(
    () => (isCurated ? filterProducts(feed.data ?? [], { search, minPrice, maxPrice }) : []),
    [isCurated, feed.data, search, minPrice, maxPrice]
  );

  const total = isCurated ? curatedMatches.length : list.data?.total ?? 0;
  const totalPages = isCurated
    ? Math.ceil(total / PRODUCT_PAGE_SIZE)
    : list.data?.totalPages ?? 0;
  const products = isCurated
    ? paginate(curatedMatches, page, PRODUCT_PAGE_SIZE)
    : list.data?.items ?? [];
  const loading = isCurated ? feed.isLoading : list.isLoading;
  const fetching = isCurated ? feed.isFetching : list.isFetching;
  const error = isCurated ? feed.error : list.error;

  useEffect(() => {
    if (!router.isReady || loading || totalPages === 0 || page <= totalPages) return;
    const query = { ...router.query };
    delete query.page;
    router.replace({ pathname: "/buyer/products", query }, undefined, { shallow: true });
  }, [router, loading, totalPages, page]);

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const categoryPath = useMemo(
    () => getCategoryPath(categories, categoryId),
    [categories, categoryId]
  );
  const activeCategory = categoryPath[categoryPath.length - 1];

  const { heading, subtitle } = getListingCopy(sortConfig, search, activeCategory?.displayName);
  const hasFilters = Boolean(search || categoryId || minPrice != null || maxPrice != null);

  const crumbs: Crumb[] = [
    { label: "Home", href: "/buyer/dashboard" },
    { label: "Products", href: "/buyer/products" },
    ...categoryCrumbs(categoryPath),
    ...(search ? [{ label: `“${search}”` }] : []),
  ];

  const openProduct = (product: Product) => router.push(`/buyer/product/${product.id}`);
  const addToCart = (product: Product) => message.success(`${product.name} added to cart`);
  const toggleWishlist = (product: Product) => message.info(`${product.name} saved for later`);

  return (
    <AppLayout
      contentStyle={{ maxWidth: WIDE_CONTENT_MAX_WIDTH }}
      maxWidth={WIDE_CONTENT_MAX_WIDTH}
      cartCount={0}
      onCartClick={() => router.push("/account/cart")}
      onSearch={(term) => applyQuery({ q: term.trim() || undefined })}
      onCategorySelect={(category) => applyQuery({ categoryId: category.id, q: undefined })}
    >
      <Head>
        <title>{`${heading} · MarketHub`}</title>
      </Head>

      <Breadcrumbs items={crumbs} style={{ marginBottom: 12 }} />

      <Title level={3} style={{ marginTop: 0, marginBottom: 4 }}>
        {heading}
      </Title>
      <Text type="secondary">{subtitle}</Text>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={6} xl={5}>
          <ProductFilter
            sort={sort}
            search={search}
            categoryId={categoryId}
            minPrice={minPrice}
            maxPrice={maxPrice}
            categories={categories}
            categoriesLoading={categoriesLoading}
            total={total}
            loading={loading}
            curated={isCurated}
            onChange={(patch: ProductFilterPatch) => applyQuery(patch)}
            onClear={() =>
              applyQuery({
                q: undefined,
                categoryId: undefined,
                minPrice: undefined,
                maxPrice: undefined,
              })
            }
            style={stickyFilterStyle}
            bodyStyle={filterBodyStyle}
          />
        </Col>

        <Col xs={24} lg={18} xl={19}>
          <div style={{ opacity: fetching && !loading ? 0.6 : 1 }}>
            <ProductGrid
              products={products}
              loading={loading}
              error={error}
              skeletonCount={PRODUCT_PAGE_SIZE}
              columns={PRODUCT_GRID_COLUMNS}
              emptyText={
                hasFilters ? "No products match these filters" : "No products listed yet"
              }
              onProductClick={openProduct}
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
            />
          </div>

          {!error && total > PRODUCT_PAGE_SIZE && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
              <Pagination
                current={page}
                pageSize={PRODUCT_PAGE_SIZE}
                total={total}
                showSizeChanger={false}
                onChange={(nextPage) => {
                  applyQuery({ page: nextPage === 1 ? undefined : nextPage }, { keepPage: true });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          )}
        </Col>
      </Row>
    </AppLayout>
  );
}
