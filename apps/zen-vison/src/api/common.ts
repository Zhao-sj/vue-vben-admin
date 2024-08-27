export enum ModuleEnum {
  SYSTEM = 'system',
}

export interface PageParam {
  pageNum: number;
  pageSize: number;
}

export interface PageResult<T> {
  list: T[];
  total: number;
}

export interface BaseSimple {
  id: number;
  name: string;
}

interface BaseTree extends BaseSimple {
  parentId: number;
}

interface TreeNode extends BaseTree {
  children: TreeNode[];
}

export function buildMenuTree<T extends BaseTree>(list: T[]) {
  const treeNodeMap = new Map<number, TreeNode>(); // TODO TreeNode类型推断需要修正
  const parentIds = new Set<number>();
  const ids = new Set<number>();

  list.forEach((item) => {
    const data = { ...item, children: [] };
    treeNodeMap.set(data.id, data);
    parentIds.add(data.parentId);
    ids.add(data.id);
  });

  const topLevelParentIds = new Set(
    [...parentIds].filter((parentId) => !ids.has(parentId)),
  );

  treeNodeMap
    .values()
    .filter((item) => !topLevelParentIds.has(item.parentId))
    .forEach((item) => {
      const parentNode = treeNodeMap.get(item.parentId);
      if (parentNode) {
        parentNode.children.push(item);
      }
    });

  return [...treeNodeMap.values()].filter((item) =>
    topLevelParentIds.has(item.parentId),
  );
}
