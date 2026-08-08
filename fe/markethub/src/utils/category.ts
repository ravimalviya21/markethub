import { Category } from "@/services/category.service";

export interface CategoryNode extends Category {
  children: CategoryNode[];
}

interface BuildCategoryTreeOptions {
  includeInactive?: boolean;
}

const byDisplayName = (a: Category, b: Category) =>
  a.displayName.localeCompare(b.displayName);

const hasAncestor = (
  nodes: Map<number, CategoryNode>,
  node: CategoryNode,
  targetId: number
) => {
  const seen = new Set<number>();
  let current: CategoryNode | undefined = node;
  while (current && !seen.has(current.id)) {
    if (current.id === targetId) return true;
    seen.add(current.id);
    current = current.parentId == null ? undefined : nodes.get(current.parentId);
  }
  return false;
};

export const buildCategoryTree = (
  categories: Category[] | null | undefined,
  { includeInactive = false }: BuildCategoryTreeOptions = {}
): CategoryNode[] => {
  if (!Array.isArray(categories) || categories.length === 0) return [];

  const nodes = new Map<number, CategoryNode>();
  categories.forEach((category) => {
    nodes.set(category.id, { ...category, children: [] });
  });

  const roots: CategoryNode[] = [];
  nodes.forEach((node) => {
    const parent = node.parentId == null ? undefined : nodes.get(node.parentId);
    if (!parent || hasAncestor(nodes, parent, node.id)) {
      roots.push(node);
      return;
    }
    parent.children.push(node);
  });

  const prune = (list: CategoryNode[]): CategoryNode[] =>
    list
      .filter((node) => includeInactive || node.isActive)
      .map((node) => ({ ...node, children: prune(node.children) }))
      .sort(byDisplayName);

  return prune(roots);
};

export interface CategoryTreeOption {
  title: string;
  value: number;
  children?: CategoryTreeOption[];
}

export const toCategoryTreeData = (nodes: CategoryNode[]): CategoryTreeOption[] =>
  nodes.map((node) => ({
    title: node.displayName,
    value: node.id,
    ...(node.children.length ? { children: toCategoryTreeData(node.children) } : {}),
  }));

export const getCategoryPath = (
  categories: Category[] | null | undefined,
  id: number | string | null | undefined
): Category[] => {
  if (id == null || !Array.isArray(categories)) return [];

  const map = new Map(categories.map((category) => [category.id, category]));
  const path: Category[] = [];
  const seen = new Set<number>();

  let current = map.get(Number(id));
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    path.unshift(current);
    current = current.parentId == null ? undefined : map.get(current.parentId);
  }

  return path;
};

export const filterCategoryTree = (nodes: CategoryNode[], term: string) => {
  const needle = term.trim().toLowerCase();
  if (!needle) return { nodes, expandedIds: [] as number[] };

  const expandedIds: number[] = [];

  const walk = (list: CategoryNode[]): CategoryNode[] =>
    list.reduce<CategoryNode[]>((acc, node) => {
      const matchedChildren = walk(node.children);
      const selfMatches = node.displayName.toLowerCase().includes(needle);
      if (!selfMatches && matchedChildren.length === 0) return acc;

      if (matchedChildren.length > 0) expandedIds.push(node.id);
      acc.push({
        ...node,
        children: matchedChildren.length > 0 ? matchedChildren : node.children,
      });
      return acc;
    }, []);

  return { nodes: walk(nodes), expandedIds };
};

export const getExpandedIdsForLevel = (nodes: CategoryNode[], level: number): number[] => {
  if (level <= 0) return [];

  const ids: number[] = [];
  const walk = (list: CategoryNode[], depth: number) => {
    if (depth > level) return;
    list.forEach((node) => {
      if (node.children.length === 0) return;
      ids.push(node.id);
      walk(node.children, depth + 1);
    });
  };

  walk(nodes, 1);
  return ids;
};
