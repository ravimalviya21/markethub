import { CSSProperties, useMemo, useState } from "react";
import { Card, Divider, InputNumber, Select, Space, Tag, TreeSelect, Typography } from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";

import Button from "./Button";
import { Category } from "@/services/category.service";
import { PRODUCT_SORT_OPTIONS, ProductSortValue } from "@/contants/product";
import { buildCategoryTree, getCategoryPath, toCategoryTreeData } from "@/utils/category";
import { formatCount, formatPrice } from "@/utils/customMethods";

const { Text } = Typography;

export type ProductFilterPatch = {
    sort?: ProductSortValue;
    q?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
};

export interface ProductFilterProps {
    sort: ProductSortValue;
    search?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    categories?: Category[];
    categoriesLoading?: boolean;
    total?: number;
    loading?: boolean;
    curated?: boolean;
    onChange: (patch: ProductFilterPatch) => void;
    onClear: () => void;
    style?: CSSProperties;
    bodyStyle?: CSSProperties;
}

interface PriceRangeProps {
    initialMin: number | null;
    initialMax: number | null;
    onApply: (min: number | null, max: number | null) => void;
}

const PriceRange = ({ initialMin, initialMax, onApply }: PriceRangeProps) => {
    const [min, setMin] = useState<number | null>(initialMin);
    const [max, setMax] = useState<number | null>(initialMax);
    const invalid = min != null && max != null && min > max;

    return (
        <>
            <Space.Compact style={{ width: "100%", marginTop: 6 }}>
                <InputNumber
                    value={min}
                    onChange={setMin}
                    min={0}
                    placeholder="Min"
                    prefix="₹"
                    size="large"
                    style={{ width: "50%" }}
                />
                <InputNumber
                    value={max}
                    onChange={setMax}
                    min={0}
                    placeholder="Max"
                    prefix="₹"
                    size="large"
                    style={{ width: "50%" }}
                />
            </Space.Compact>
            <Button
                block
                style={{ marginTop: 12 }}
                disabled={invalid}
                onClick={() => onApply(min, max)}
            >
                Apply price
            </Button>
        </>
    );
};

const ProductFilter = ({
    sort,
    search = "",
    categoryId,
    minPrice,
    maxPrice,
    categories = [],
    categoriesLoading = false,
    total,
    loading = false,
    curated = false,
    onChange,
    onClear,
    style,
    bodyStyle,
}: ProductFilterProps) => {
    const treeData = useMemo(
        () => toCategoryTreeData(buildCategoryTree(categories)),
        [categories]
    );
    const categoryPath = useMemo(
        () => getCategoryPath(categories, categoryId),
        [categories, categoryId]
    );
    const activeCategory = categoryPath[categoryPath.length - 1];
    const hasFilters = Boolean(search || categoryId || minPrice != null || maxPrice != null);

    return (
        <Card
            title={
                <Space size={8}>
                    <FilterOutlined />
                    <Text strong>Filters</Text>
                </Space>
            }
            styles={{ body: bodyStyle ?? { padding: 16 } }}
            style={style}
        >
            <Space size={8} wrap style={{ width: "100%" }}>
                {total != null && (
                    <Text type="secondary">
                        {loading ? "Loading products…" : `${formatCount(total)} products`}
                    </Text>
                )}
                {curated && (
                    <Tag color="blue" style={{ margin: 0 }}>
                        Curated selection
                    </Tag>
                )}
            </Space>

            {hasFilters && (
                <Space size={8} wrap style={{ width: "100%", marginTop: 12 }}>
                    {search && (
                        <Tag closable onClose={() => onChange({ q: undefined })} style={{ margin: 0 }}>
                            “{search}”
                        </Tag>
                    )}
                    {activeCategory && (
                        <Tag
                            closable
                            onClose={() => onChange({ categoryId: undefined })}
                            style={{ margin: 0 }}
                        >
                            {activeCategory.displayName}
                        </Tag>
                    )}
                    {(minPrice != null || maxPrice != null) && (
                        <Tag
                            closable
                            onClose={() => onChange({ minPrice: undefined, maxPrice: undefined })}
                            style={{ margin: 0 }}
                        >
                            {formatPrice(minPrice ?? 0, "INR")} –{" "}
                            {maxPrice != null ? formatPrice(maxPrice, "INR") : "any"}
                        </Tag>
                    )}
                </Space>
            )}

            <Divider style={{ margin: "16px 0 12px" }} />

            <Text type="secondary" style={{ fontSize: 13 }}>
                Sort by
            </Text>
            <Select<ProductSortValue>
                value={sort}
                onChange={(value) => onChange({ sort: value })}
                options={PRODUCT_SORT_OPTIONS}
                size="large"
                style={{ width: "100%", marginTop: 6 }}
            />

            <Divider style={{ margin: "20px 0 12px" }} />

            <Text type="secondary" style={{ fontSize: 13 }}>
                Category
            </Text>
            <TreeSelect
                value={categoryId}
                onChange={(value) => onChange({ categoryId: value ?? undefined })}
                treeData={treeData}
                treeDefaultExpandedKeys={categoryPath.map((category) => category.id)}
                placeholder={categoriesLoading ? "Loading categories…" : "All categories"}
                loading={categoriesLoading}
                allowClear
                showSearch={{ treeNodeFilterProp: "title" }}
                size="large"
                style={{ width: "100%", marginTop: 6 }}
            />

            <Divider style={{ margin: "20px 0 12px" }} />

            <Text type="secondary" style={{ fontSize: 13 }}>
                Price range
            </Text>
            <PriceRange
                key={`${minPrice ?? ""}-${maxPrice ?? ""}`}
                initialMin={minPrice ?? null}
                initialMax={maxPrice ?? null}
                onApply={(min, max) =>
                    onChange({ minPrice: min ?? undefined, maxPrice: max ?? undefined })
                }
            />

            <Divider style={{ margin: "20px 0 12px" }} />

            <Button
                type="default"
                block
                icon={<ReloadOutlined />}
                disabled={!hasFilters}
                onClick={onClear}
            >
                Clear filters
            </Button>
        </Card>
    );
};

export default ProductFilter;
