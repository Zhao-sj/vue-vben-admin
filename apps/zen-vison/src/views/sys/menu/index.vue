<script setup lang="ts">
import type { VxeGridProps } from 'vxe-table';

import { useVbenModal } from '@vben/common-ui';
import { Icon } from '@vben/icons';

import { deleteMenuApi, getMenuListApi, type MenuApi } from '#/api';
import { type ActionItem, TableAction, VxeBasicTable } from '#/components';
import { DictTypeEnum, MenuType } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { formatToDateTime } from '#/utils';

import { TableAdd, TableEdit, TableQuery } from './components';

type MenuColumns = VxeGridProps<MenuApi.Menu>['columns'];

const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS);

let menuQuery: MenuApi.Query = {};
const vxeBasicTableRef = ref<InstanceType<typeof VxeBasicTable>>();

const [TableAddModal, addModal] = useVbenModal({
  connectedComponent: TableAdd,
});

const [TableEditModal, editModal] = useVbenModal({
  connectedComponent: TableEdit,
});

const vxeTable = computed(() =>
  vxeBasicTableRef.value?.getTableInstance<MenuApi.Menu>(),
);

const columns = computed<MenuColumns>(() => [
  {
    field: 'name',
    headerAlign: 'center',
    minWidth: 200,
    title: $t('zen.service.menu.name'),
    treeNode: true,
  },
  {
    align: 'center',
    minWidth: 80,
    slots: { default: 'icon' },
    title: $t('zen.service.menu.icon'),
  },
  {
    field: 'permission',
    headerAlign: 'center',
    minWidth: 200,
    title: $t('zen.service.menu.permission'),
  },
  {
    field: 'component',
    headerAlign: 'center',
    minWidth: 350,
    title: $t('zen.service.menu.component'),
  },
  {
    align: 'center',
    field: 'sort',
    minWidth: 80,
    title: $t('zen.service.menu.sort'),
  },
  {
    align: 'center',
    field: 'status',
    minWidth: 100,
    slots: { default: 'status' },
    title: $t('zen.service.menu.status'),
  },
  {
    align: 'center',
    field: 'createTime',
    formatter: ({ cellValue }) => formatToDateTime(cellValue),
    minWidth: 150,
    title: $t('zen.common.createTime'),
  },
  {
    align: 'center',
    fixed: 'right',
    slots: { default: 'opt' },
    title: $t('zen.common.opt'),
    width: 120,
  },
]);

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:menu:create',
    icon: 'ep:plus',
    onClick: () => addModal.open(),
    title: $t('zen.common.create'),
    type: 'primary',
  },
]);

const tableOpts = reactive<VxeGridProps<MenuApi.Menu>>({
  customConfig: {},
  id: 'menu_manage',
  keyboardConfig: {
    isArrow: true,
    isBack: true,
    isEnter: true,
  },
  printConfig: {},
  proxyConfig: {
    ajax: {
      query: () => getMenuListApi(menuQuery),
    },
  },
  rowConfig: {
    isCurrent: true,
  },
  stripe: false,
  toolbarConfig: {
    print: true,
    refresh: true,
    slots: {
      buttons: 'toolbar_left',
      tools: 'toolbar_right',
    },
  },
  treeConfig: {
    expandAll: true,
    parentField: 'parentId',
    rowField: 'id',
    transform: true,
  },
});

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
        content: $t('zen.common.edit'),
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
              ElMessage.success($t('zen.common.successTip'));
              reloadTable();
            });
          },
        },
        title: $t('zen.common.confirmDelete'),
      },
      tooltip: {
        content: $t('zen.common.delete'),
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
        content: $t('zen.common.create'),
      },
    });
  }

  return actions;
}

function handleQuery(query: MenuApi.Query) {
  menuQuery = query;
  vxeTable.value?.commitProxy('query');
}

function reloadTable() {
  vxeTable.value?.commitProxy('reload');
}

function toggleExpandAll() {
  const expandRecords = vxeTable.value?.getTreeExpandRecords();
  vxeTable.value?.setAllTreeExpand(expandRecords?.length === 0);
}
</script>

<template>
  <VxeBasicTable ref="vxeBasicTableRef" :columns="columns" v-bind="tableOpts">
    <template #form>
      <TableQuery @query="handleQuery" />
    </template>

    <template #toolbar_left>
      <TableAction
        :actions="toolbarActions"
        :link="false"
        :show-empty="false"
        circle
      />

      <TableAddModal @success="reloadTable" />
      <TableEditModal @success="reloadTable" />
    </template>

    <template #toolbar_right>
      <div class="mr-3">
        <ElButton
          :title="`${$t('zen.common.expand')} / ${$t('zen.common.collapsed')}`"
          circle
          class="scale-110"
          plain
          @click="toggleExpandAll"
        >
          <Icon icon="ep:sort" />
        </ElButton>
      </div>
    </template>

    <template #icon="{ row }">
      <div v-if="row.meta?.icon" class="flex justify-center">
        <Icon :icon="row.meta.icon" class="text-xl" />
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
  </VxeBasicTable>
</template>
