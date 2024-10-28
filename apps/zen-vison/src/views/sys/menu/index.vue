<script setup lang="ts">
import { Page, useVbenModal } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { deleteMenuApi, getMenuListApi, type MenuApi } from '#/api';
import { type ActionItem, TableAction } from '#/components';
import { DictTypeEnum, MenuType } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

import { TableAdd, TableEdit, TableQuery } from './components';

type MenuColumns = VxeGridProps<MenuApi.Menu>['columns'];

const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS);

let menuQuery: MenuApi.Query = {};

const [TableAddModal, addModal] = useVbenModal({
  connectedComponent: TableAdd,
});

const [TableEditModal, editModal] = useVbenModal({
  connectedComponent: TableEdit,
});

const columns: MenuColumns = [
  {
    field: 'name',
    headerAlign: 'center',
    align: 'left',
    minWidth: 200,
    title: $t('sys.menu.name'),
    treeNode: true,
  },
  {
    minWidth: 80,
    slots: { default: 'icon' },
    title: $t('sys.menu.icon'),
  },
  {
    field: 'permission',
    headerAlign: 'center',
    align: 'left',
    minWidth: 200,
    title: $t('sys.menu.permission'),
  },
  {
    field: 'component',
    headerAlign: 'center',
    align: 'left',
    minWidth: 350,
    title: $t('sys.menu.component'),
  },
  {
    field: 'sort',
    minWidth: 80,
    title: $t('sys.menu.sort'),
  },
  {
    field: 'status',
    minWidth: 100,
    slots: { default: 'status' },
    title: $t('sys.menu.status'),
  },
  {
    field: 'createTime',
    formatter: 'formatDateTime',
    minWidth: 150,
    title: $t('page.createTime'),
  },
  {
    fixed: 'right',
    slots: { default: 'opt' },
    title: $t('page.options'),
    width: 120,
  },
];

const gridOptions: VxeGridProps<MenuApi.Menu> = {
  columns,
  customConfig: {},
  id: 'menu_manage',
  keyboardConfig: {
    isArrow: true,
    isBack: true,
    isEnter: true,
  },
  proxyConfig: {
    ajax: {
      query: () => getMenuList(menuQuery),
    },
  },
  pagerConfig: {
    enabled: false,
  },
  height: 'auto',
  stripe: false,
  toolbarConfig: {
    refresh: true,
  },
  treeConfig: {
    expandAll: true,
    parentField: 'parentId',
    rowField: 'id',
    transform: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions: {}, gridOptions });

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:menu:create',
    icon: 'ep:plus',
    onClick: () => addModal.open(),
    title: $t('page.create'),
    type: 'primary',
  },
]);

function createActions(row: MenuApi.Menu) {
  const actions: ActionItem[] = [
    {
      auth: 'system:menu:update',
      icon: 'ep:edit',
      onClick: () => {
        editModal.setData({ id: row.id });
        editModal.open();
      },
      tooltip: {
        content: $t('page.edit'),
      },
      type: 'primary',
    },
    {
      auth: 'system:menu:delete',
      icon: 'ep:delete',
      popConfirm: {
        on: {
          confirm: () => {
            deleteMenuApi(row.id).then(() => {
              ElMessage.success($t('page.success'));
              reloadTable();
            });
          },
        },
        title: $t('page.confirmDelete'),
      },
      tooltip: {
        content: $t('page.delete'),
      },
      type: 'danger',
    },
  ];

  if (row.type !== MenuType.BUTTON) {
    actions.unshift({
      auth: 'system:menu:create',
      icon: 'ep:plus',
      onClick: () => {
        addModal.setData({ parentId: row.id });
        addModal.open();
      },
      tooltip: {
        content: $t('page.create'),
      },
    });
  }

  return actions;
}

async function getMenuList(menuQuery: MenuApi.Query) {
  const list = await getMenuListApi(menuQuery);
  return { list };
}

function handleQuery(query: MenuApi.Query) {
  menuQuery = query;
  reloadTable();
}

async function reloadTable() {
  await gridApi.query(menuQuery);
  gridApi.grid.setAllTreeExpand(true);
}

function toggleExpandAll() {
  const expandRecords = gridApi.grid.getTreeExpandRecords();
  gridApi.grid.setAllTreeExpand(expandRecords?.length === 0);
}
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #form>
        <TableQuery @query="handleQuery" />
      </template>

      <template #toolbar-actions>
        <TableAction
          :actions="toolbarActions"
          :link="false"
          :show-empty="false"
          circle
        />

        <TableAddModal @success="reloadTable" />
        <TableEditModal @success="reloadTable" />
      </template>

      <template #toolbar-tools>
        <div class="mr-3">
          <ElButton
            :title="`${$t('page.expand')} / ${$t('page.collapsed')}`"
            circle
            class="scale-95"
            plain
            @click="toggleExpandAll"
          >
            <IconifyIcon icon="ep:sort" />
          </ElButton>
        </div>
      </template>

      <template #icon="{ row }">
        <div v-if="row.meta?.icon" class="flex justify-center">
          <IconifyIcon :icon="row.meta.icon" class="text-xl" />
        </div>
      </template>

      <template #status="{ row: { status } }">
        <ElTag :type="dictStore.getStatus(status)?.color">
          {{ dictStore.getStatus(status)?.label }}
        </ElTag>
      </template>

      <template #opt="{ row }">
        <TableAction :actions="createActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
