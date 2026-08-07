import { ReactNode, useMemo, useState } from "react";
import { Alert, Card, Empty, Input, Skeleton, Tree, Typography } from "antd";
import type { TreeDataNode, TreeProps } from "antd";
import { AppstoreOutlined, SearchOutlined } from "@ant-design/icons";

import { Category, useCategories } from "@/services/category.service";
import {
  CategoryNode,
  buildCategoryTree,
  filterCategoryTree,
  getCategoryPath,
  getExpandedIdsForLevel,
} from "@/utils/category";
import { getApiErrorMessage } from "@/utils/customMethods";

const { Text } = Typography;

type TreePassthrough = Omit<
  TreeProps,
  | "treeData"
  | "onSelect"
  | "selectedKeys"
  | "expandedKeys"
  | "onExpand"
  | "autoExpandParent"
  | "loadData"
>;

export interface CategoryTreeProps extends TreePassthrough {
  categories?: Category[];
  loading?: boolean;
  includeInactive?: boolean;
  selectedId?: number | null;
  defaultSelectedId?: number | null;
  onCategorySelect?: (category: Category | null, path: Category[]) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  showImages?: boolean;
  defaultExpandedLevel?: number;
  card?: boolean;
  title?: ReactNode;
  emptyText?: string;
  maxHeight?: number | string;
}

const NodeTitle = ({
  category,
  showImage,
}: {
  category: CategoryNode;
  showImage: boolean;
}) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
    {showImage &&
      (category.imageUrl ? (
        <img
          src={category.imageUrl}
          alt={category.displayName}
          style={{
            width: 22,
            height: 22,
            borderRadius: 4,
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
      ) : (
        <AppstoreOutlined style={{ color: "#bfbfbf", fontSize: 14 }} />
      ))}
    <span>{category.displayName}</span>
    {!category.isActive && (
      <Text type="secondary" style={{ fontSize: 11 }}>
        (hidden)
      </Text>
    )}
  </span>
);

const toTreeData = (nodes: CategoryNode[], showImages: boolean): TreeDataNode[] =>
  nodes.map((node) => ({
    key: String(node.id),
    title: <NodeTitle category={node} showImage={showImages} />,
    isLeaf: node.children.length === 0,
    children: node.children.length ? toTreeData(node.children, showImages) : undefined,
  }));

const CategoryTree = ({
  categories,
  loading = false,
  includeInactive = false,
  selectedId,
  defaultSelectedId = null,
  onCategorySelect,
  searchable = false,
  searchPlaceholder = "Search categories",
  showImages = true,
  defaultExpandedLevel = 0,
  card = true,
  title = "Shop by category",
  emptyText = "No categories yet",
  maxHeight,
  style,
  ...treeProps
}: CategoryTreeProps) => {
  const isControlled = selectedId !== undefined;
  const hasProvidedData = categories !== undefined;

  const query = useCategories({ enabled: !hasProvidedData });
  const source = hasProvidedData ? categories : query.data;
  const isLoading = loading || (!hasProvidedData && query.isLoading);
  const error = hasProvidedData ? null : query.error;

  const [search, setSearch] = useState("");
  const [internalSelectedId, setInternalSelectedId] = useState<number | null>(
    defaultSelectedId
  );
  const [userExpandedKeys, setUserExpandedKeys] = useState<string[] | null>(null);

  const tree = useMemo(
    () => buildCategoryTree(source, { includeInactive }),
    [source, includeInactive]
  );

  const { nodes: visibleTree, expandedIds } = useMemo(
    () => filterCategoryTree(tree, searchable ? search : ""),
    [tree, search, searchable]
  );

  const treeData = useMemo(
    () => toTreeData(visibleTree, showImages),
    [visibleTree, showImages]
  );

  const categoryById = useMemo(() => {
    const map = new Map<number, Category>();
    (source ?? []).forEach((category) => map.set(category.id, category));
    return map;
  }, [source]);

  const derivedExpandedKeys = useMemo(
    () =>
      (search.trim()
        ? expandedIds
        : getExpandedIdsForLevel(tree, defaultExpandedLevel)
      ).map(String),
    [search, expandedIds, tree, defaultExpandedLevel]
  );

  const expandedKeys = userExpandedKeys ?? derivedExpandedKeys;
  const activeId = isControlled ? selectedId : internalSelectedId;

  const handleSelect: TreeProps["onSelect"] = (keys) => {
    const key = keys[0];
    const id = key == null ? null : Number(key);
    if (!isControlled) setInternalSelectedId(id);
    if (!onCategorySelect) return;
    const category = id == null ? null : categoryById.get(id) ?? null;
    onCategorySelect(category, getCategoryPath(source, id));
  };

  const handleExpand: TreeProps["onExpand"] = (keys) => {
    setUserExpandedKeys(keys.map(String));
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setUserExpandedKeys(null);
  };

  const body = (
    <>
      {searchable && (
        <Input
          allowClear
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={searchPlaceholder}
          prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
          style={{ marginBottom: 12 }}
        />
      )}

      {error && (
        <Alert
          type="error"
          showIcon
          message={getApiErrorMessage(error, "Could not load categories")}
        />
      )}

      {!error && isLoading && <Skeleton active title={false} paragraph={{ rows: 6 }} />}

      {!error && !isLoading && treeData.length === 0 && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={search ? `No match for "${search}"` : emptyText}
        />
      )}

      {!error && !isLoading && treeData.length > 0 && (
        <div style={{ maxHeight, overflow: maxHeight ? "auto" : undefined }}>
          <Tree
            blockNode
            treeData={treeData}
            selectedKeys={activeId == null ? [] : [String(activeId)]}
            expandedKeys={expandedKeys}
            autoExpandParent={userExpandedKeys === null}
            onSelect={handleSelect}
            onExpand={handleExpand}
            {...treeProps}
          />
        </div>
      )}
    </>
  );

  if (!card) return <div style={style}>{body}</div>;

  return (
    <Card title={title} styles={{ body: { padding: 16 } }} style={style}>
      {body}
    </Card>
  );
};

export default CategoryTree;
