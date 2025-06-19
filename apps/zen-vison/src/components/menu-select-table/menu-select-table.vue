<script setup lang="ts">
import type { CheckboxValueType } from 'element-plus';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MenuApi } from '#/api';

import { VbenCheckButtonGroup } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { uniq } from 'lodash-es';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { MENU_ROOT, MenuType } from '#/enums';
import { $t } from '#/locales';

interface Props {
  menus?: MenuApi.Simple[];
  defaultExpandAll?: boolean;
  defaultCheckedKeys?: number[];
}

interface TreeNode extends MenuApi.Simple {
  children?: TreeNode[];
  permission?: TreeNode[];
  checkedIds?: number[];
}

const props = withDefaults(defineProps<Props>(), {
  menus: () => [],
  defaultExpandAll: true,
  defaultCheckedKeys: () => [],
});

const menuTypes = {
  [MenuType.DIR]: {
    icon: 'flat-color-icons:folder',
    label: $t('sys.menu.dir'),
  },
  [MenuType.MENU]: {
    icon: 'lucide:menu',
    label: $t('sys.menu.menu'),
  },
};

const strictlyOptions = [
  { label: $t('sys.menu.unStrictly'), value: false },
  { label: $t('sys.menu.strictly'), value: true },
];

const isStrictly = ref(false);
const checkedCount = ref(0);

const columns: VxeTableGridOptions<TreeNode>['columns'] = [
  {
    field: 'name',
    type: 'checkbox',
    title: $t('sys.menu.name'),
    align: 'left',
    treeNode: true,
    minWidth: 200,
    slots: { default: 'name' },
  },
  {
    field: 'type',
    align: 'center',
    title: $t('sys.menu.type'),
    width: 100,
    slots: { default: 'type' },
  },
  {
    field: 'permission',
    headerAlign: 'center',
    minWidth: 280,
    title: $t('sys.menu.permission'),
    slots: { default: 'permission' },
  },
];

const gridOptions: VxeTableGridOptions<TreeNode> = {
  columns,
  height: 'auto',
  stripe: false,
  showOverflow: false,
  checkboxConfig: {
    labelField: 'name',
    checkStrictly: !isStrictly.value,
  },
  scrollY: {
    enabled: true,
    gt: 0,
  },
  proxyConfig: {
    enabled: false,
  },
  pagerConfig: {
    enabled: false,
  },
  toolbarConfig: {
    refresh: false,
    custom: false,
  },
  rowConfig: {
    isHover: false,
    isCurrent: false,
    keyField: 'id',
  },
  treeConfig: {
    parentField: 'parentId',
    rowField: 'id',
    transform: false,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions,
  gridEvents: {
    checkboxAll: ({ checked }: { checked: boolean }) => {
      setAllPermissionChecked(checked);
      updateCheckCount();
    },
    checkboxChange: ({ checked, row }: { checked: boolean; row: TreeNode }) => {
      isStrictly.value && setRowPermissionChecked(row, checked);
      updateCheckCount();
    },
  },
});

function updateCheckCount() {
  checkedCount.value = getCheckedKeys().length;
}

function setPermissionChecked(records: TreeNode[], keys: number[]) {
  records.forEach((row) => {
    if (row.type === MenuType.MENU) {
      row.checkedIds = row.permission
        ?.filter((p) => keys.includes(p.id))
        .map((item) => item.id);
      return;
    }

    if (row.children && row.children.length > 0) {
      setPermissionChecked(row.children, keys);
    }
  });
}

function setAllPermissionChecked(checked: boolean) {
  const dataList = gridApi.grid.getFullData();
  dataList.forEach((item) => {
    setRowPermissionChecked(item, checked);
  });
}

function setRowPermissionChecked(row: TreeNode, checked: boolean) {
  if (row.type === MenuType.DIR) {
    if (!row.children || row.children.length === 0) return;
    row.children.forEach((item) => {
      if (item.type === MenuType.DIR) {
        setRowPermissionChecked(item, checked);
        return;
      }
      item.checkedIds = checked ? item.permission?.map((p) => p.id) : [];
    });
  }

  if (row.type === MenuType.MENU) {
    row.checkedIds = checked ? row.permission?.map((item) => item.id) : [];
  }
}

let lastCheckedKeys: number[] = [];
function handleStrictlyBeforeChange(
  strictly: boolean | number | string,
  _: boolean,
): undefined {
  lastCheckedKeys = getCheckedKeys();
  if (strictly) {
    const records = gridApi.grid.getFullData();
    const dirKeys = getDirKeys(records);
    lastCheckedKeys = lastCheckedKeys.filter((key) => !dirKeys.includes(key));
  }
}

async function handleStrictlyChange(strictly: boolean) {
  gridApi.setGridOptions({
    checkboxConfig: {
      checkStrictly: !strictly,
    },
  });

  await gridApi.grid.clearCheckboxRow();
  await gridApi.grid.setCheckboxRowKey(lastCheckedKeys, true);
  updateCheckCount();
}

function handleTreeExpandAll(expand: boolean) {
  gridApi.grid.setAllTreeExpand(expand);
}

function handlePermissionChecked(row: TreeNode, value: CheckboxValueType[]) {
  isStrictly.value && gridApi.grid.setCheckboxRow(row, value.length > 0);
  updateCheckCount();
}

function getKeys(records: TreeNode[], addCurrent: boolean) {
  const keys: number[] = [];

  for (const row of records) {
    if (row.type === MenuType.MENU) {
      addCurrent && keys.push(row.id);
      row.checkedIds && keys.push(...row.checkedIds);
    }

    if (row.children && row.children.length > 0) {
      const childrenKeys = getKeys(row.children, addCurrent);
      if (childrenKeys.length > 0 && addCurrent) {
        keys.push(row.id);
      }
      keys.push(...childrenKeys);
    }
  }

  return uniq(keys);
}

function getDirKeys(records: TreeNode[]) {
  const keys: number[] = [];
  for (const row of records) {
    if (row.type !== MenuType.DIR) {
      continue;
    }

    keys.push(row.id);
    if (row.children && row.children.length > 0) {
      const childrenKeys = getDirKeys(row.children);
      keys.push(...childrenKeys);
    }
  }
  return uniq(keys);
}

function getCheckedKeys() {
  const checkedRecords = gridApi.grid.getCheckboxRecords(true);
  const records = gridApi.grid.getFullData();
  const permissionKeys = getKeys(records, false);

  if (isStrictly.value) {
    const checkedKeys = getKeys(checkedRecords, true);
    const checkParentKeys = gridApi.grid
      .getCheckboxIndeterminateRecords(true)
      .map((item) => item.id);
    checkedKeys.push(...permissionKeys, ...checkParentKeys);
    return uniq(checkedKeys);
  }

  const checkedKeys = checkedRecords.map((item) => item.id);
  checkedKeys.push(...permissionKeys);
  return uniq(checkedKeys);
}

function setCheckedKeys(keys: number[]) {
  if (keys.length === 0) return;
  const records = gridApi.grid.getFullData();
  gridApi.grid.clearCheckboxRow();
  gridApi.grid.setCheckboxRowKey(keys, true);
  setPermissionChecked(records, keys);
  updateCheckCount();
}

function convertMenuToTree(menus: MenuApi.Simple[]): TreeNode[] {
  const menuMap = new Map<number, TreeNode>();

  menus.forEach((menu) => {
    menuMap.set(menu.id, menu);
  });

  const roots: TreeNode[] = [];

  menus.forEach((menu) => {
    const node = menuMap.get(menu.id)!;

    if (menu.parentId === MENU_ROOT) {
      roots.push(node);
      return;
    }

    const parent = menuMap.get(menu.parentId);
    if (!parent) return;

    if (parent.type === 1) {
      if (!parent.children) parent.children = [];
      parent.children.push(node);
    }

    if (parent.type === 2) {
      if (!parent.permission) parent.permission = [];
      parent.permission.push(node);
    }
  });

  return roots;
}

watchEffect(async () => {
  const treeList = convertMenuToTree(props.menus);
  await nextTick();
  await gridApi.grid.loadData(treeList);
  await gridApi.grid.setAllTreeExpand(props.defaultExpandAll);
  setCheckedKeys(props.defaultCheckedKeys);
});

defineExpose({
  getCheckedKeys,
  setCheckedKeys,
});
</script>

<template>
  <Grid>
    <template #toolbar-actions>
      <div class="flex items-center gap-3">
        <VbenCheckButtonGroup
          v-model="isStrictly"
          :options="strictlyOptions"
          :show-icon="false"
          :before-change="handleStrictlyBeforeChange"
          @btn-click="handleStrictlyChange"
        />

        <div>
          <ElAlert :closable="false">
            <span>{{ $t('sys.menu.selected') }}</span>
            <span class="text-primary mx-1 font-semibold">
              {{ checkedCount }}
            </span>
            <span>{{ $t('sys.menu.node') }}</span>
          </ElAlert>
        </div>
      </div>
    </template>

    <template #toolbar-tools>
      <div class="flex items-center">
        <ElButton @click="handleTreeExpandAll(false)">
          {{ $t('sys.menu.collapsed') }}
        </ElButton>
        <ElButton @click="handleTreeExpandAll(true)">
          {{ $t('sys.menu.expand') }}
        </ElButton>
      </div>
    </template>

    <template #name="{ row: { name, icon } }">
      <div class="inline-flex items-center gap-1">
        <IconifyIcon v-if="icon" :icon />
        <span>{{ name }}</span>
      </div>
    </template>

    <template #type="{ row: { type } }">
      <div class="flex items-center justify-center gap-1">
        <IconifyIcon :icon="menuTypes[type as keyof typeof menuTypes].icon" />
        <span>{{ menuTypes[type as keyof typeof menuTypes].label }}</span>
      </div>
    </template>

    <template #permission="{ row }">
      <ElCheckboxGroup
        v-if="row.permission"
        v-model="row.checkedIds"
        class="flex flex-wrap"
        @change="handlePermissionChecked(row, $event)"
      >
        <ElCheckbox
          v-for="item in row.permission"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </ElCheckboxGroup>
    </template>
  </Grid>
</template>
