import { useMemo, useState } from "react";
import { Skeleton, theme } from "antd";
import { DownOutlined, RightOutlined, UpOutlined } from "@ant-design/icons";

import { Category, useCategories } from "@/services/category.service";
import { CategoryNode, buildCategoryTree, getCategoryPath } from "@/utils/category";

const MORE_ID = -1;

const barStyle: React.CSSProperties = {
  background: "#fff",
  borderBottom: "1px solid #f0f0f0",
  boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
};

const barInnerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  width: "100%",
  margin: "0 auto",
  padding: "0 16px",
  overflowX: "auto",
};

export interface CategoryNavProps {
  categories?: Category[];
  loading?: boolean;
  includeInactive?: boolean;
  maxItems?: number;
  columns?: number;
  maxWidth?: number;
  onCategorySelect?: (category: Category, path: Category[]) => void;
}

const distributeGroups = (groups: CategoryNode[], columns: number): CategoryNode[][] => {
  const buckets: CategoryNode[][] = Array.from({ length: columns }, () => []);
  const weights = new Array(columns).fill(0);

  groups.forEach((group) => {
    const target = weights.indexOf(Math.min(...weights));
    buckets[target].push(group);
    weights[target] += 1 + Math.min(group.children.length, 12);
  });

  return buckets.filter((bucket) => bucket.length > 0);
};

interface NodeRowProps {
  node: CategoryNode;
  onSelect: (node: CategoryNode) => void;
}

const Flyout = ({ nodes, onSelect }: { nodes: CategoryNode[]; onSelect: NodeRowProps["onSelect"] }) => (
  <div
    style={{
      position: "absolute",
      top: -8,
      left: "100%",
      minWidth: 200,
      maxHeight: 360,
      overflowY: "auto",
      background: "#fff",
      borderRadius: 8,
      boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
      padding: "8px 0",
      zIndex: 2,
    }}
  >
    {nodes.map((node) => (
      <NodeRow key={node.id} node={node} onSelect={onSelect} />
    ))}
  </div>
);

const NodeRow = ({ node, onSelect }: NodeRowProps) => {
  const { token } = theme.useToken();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const hasChildren = node.children.length > 0;

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => {
        setOpen(true);
        setHovered(true);
      }}
      onMouseLeave={() => {
        setOpen(false);
        setHovered(false);
      }}
    >
      <button
        type="button"
        onClick={() => onSelect(node)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          width: "100%",
          padding: "6px 16px",
          border: "none",
          background: "transparent",
          textAlign: "left",
          cursor: "pointer",
          fontSize: 13,
          lineHeight: 1.5,
          color: hovered ? token.colorPrimary : "#212121",
        }}
      >
        <span>{node.displayName}</span>
        {hasChildren && <RightOutlined style={{ fontSize: 9, color: "#9e9e9e" }} />}
      </button>

      {open && hasChildren && <Flyout nodes={node.children} onSelect={onSelect} />}
    </div>
  );
};

const GroupHeading = ({ node, onSelect }: NodeRowProps) => {
  const { token } = theme.useToken();
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onSelect(node)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        width: "100%",
        padding: "6px 16px",
        border: "none",
        background: "transparent",
        textAlign: "left",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        color: hovered ? token.colorPrimary : "#212121",
      }}
    >
      {node.displayName}
    </button>
  );
};

const MegaPanel = ({
  groups,
  columns,
  maxWidth,
  onSelect,
}: {
  groups: CategoryNode[];
  columns: number;
  maxWidth: number;
  onSelect: NodeRowProps["onSelect"];
}) => {
  const buckets = distributeGroups(groups, columns);

  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        background: "#fff",
        boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
        borderTop: "1px solid #f0f0f0",
        zIndex: 90,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          maxWidth,
          width: "100%",
          margin: "0 auto",
          padding: "20px 8px",
          alignItems: "flex-start",
        }}
      >
        {buckets.map((bucket, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              minWidth: 0,
              borderRight: index < buckets.length - 1 ? "1px solid #f5f5f5" : undefined,
            }}
          >
            {bucket.map((group) => (
              <div key={group.id} style={{ marginBottom: 20 }}>
                <GroupHeading node={group} onSelect={onSelect} />
                {group.children.map((child) => (
                  <NodeRow key={child.id} node={child} onSelect={onSelect} />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const CategoryNav = ({
  categories,
  loading = false,
  includeInactive = false,
  maxItems = 9,
  columns = 5,
  maxWidth = 1280,
  onCategorySelect,
}: CategoryNavProps) => {
  const { token } = theme.useToken();
  const hasProvidedData = categories !== undefined;

  const query = useCategories({ enabled: !hasProvidedData });
  const source = hasProvidedData ? categories : query.data;
  const isLoading = loading || (!hasProvidedData && query.isLoading);

  const [activeId, setActiveId] = useState<number | null>(null);

  const tree = useMemo(
    () => buildCategoryTree(source, { includeInactive }),
    [source, includeInactive]
  );

  const barItems = useMemo<CategoryNode[]>(() => {
    if (tree.length <= maxItems) return tree;
    const overflow = tree.slice(maxItems);
    return [
      ...tree.slice(0, maxItems),
      {
        id: MORE_ID,
        parentId: null,
        displayName: "More",
        imageUrl: null,
        isActive: true,
        createdBy: 0,
        updatedBy: 0,
        children: overflow,
      },
    ];
  }, [tree, maxItems]);

  const activeItem = barItems.find((item) => item.id === activeId) ?? null;

  const handleSelect = (node: CategoryNode) => {
    setActiveId(null);
    if (node.id === MORE_ID) return;
    onCategorySelect?.(node, getCategoryPath(source, node.id));
  };

  if (isLoading) {
    return (
      <div style={barStyle}>
        <div style={{ ...barInnerStyle, maxWidth }}>
          <Skeleton.Button active size="small" style={{ width: 90 }} />
          <Skeleton.Button active size="small" style={{ width: 110 }} />
          <Skeleton.Button active size="small" style={{ width: 80 }} />
          <Skeleton.Button active size="small" style={{ width: 120 }} />
        </div>
      </div>
    );
  }

  if (barItems.length === 0) return null;

  return (
    <div style={{ position: "relative" }} onMouseLeave={() => setActiveId(null)}>
      <div style={barStyle}>
        <div style={{ ...barInnerStyle, maxWidth }}>
          {barItems.map((item) => {
            const isActive = item.id === activeId;
            const hasChildren = item.children.length > 0;

            return (
              <button
                key={item.id}
                type="button"
                onMouseEnter={() => setActiveId(hasChildren ? item.id : null)}
                onClick={() => handleSelect(item)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "14px 12px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontSize: 14,
                  fontWeight: 600,
                  color: isActive ? token.colorPrimary : "#212121",
                }}
              >
                {item.displayName}
                {hasChildren &&
                  (isActive ? (
                    <UpOutlined style={{ fontSize: 10 }} />
                  ) : (
                    <DownOutlined style={{ fontSize: 10, color: "#9e9e9e" }} />
                  ))}
              </button>
            );
          })}
        </div>
      </div>

      {activeItem && activeItem.children.length > 0 && (
        <MegaPanel
          groups={activeItem.children}
          columns={columns}
          maxWidth={maxWidth}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
};

export default CategoryNav;
