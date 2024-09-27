<script setup lang="ts">
import type { VxeGridProps } from 'vxe-table';

import { useVbenModal } from '@vben/common-ui';
import { Icon } from '@vben/icons';

import {
  deleteDeptApi,
  type DeptApi,
  getDeptListApi,
  getUserSimpleListApi,
} from '#/api';
import { type ActionItem, TableAction, VxeBasicTable } from '#/components';
import { DictStatus, DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { formatToDateTime } from '#/utils';

import { TableAdd, TableEdit, TableQuery } from './components';

type DeptColumns = VxeGridProps<DeptApi.Dept>['columns'];

const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS);

let deptQuery: DeptApi.Query = {};
const vxeBasicTableRef = ref<InstanceType<typeof VxeBasicTable>>();

const { data: userList } = useRequest(getUserSimpleListApi);

const [TableAddModal, addModal] = useVbenModal({
  connectedComponent: TableAdd,
});

const [TableEditModal, editModal] = useVbenModal({
  connectedComponent: TableEdit,
});

const vxeTable = computed(() =>
  vxeBasicTableRef.value?.getTableInstance<DeptApi.Dept>(),
);

const columns = computed<DeptColumns>(() => [
  {
    field: 'name',
    headerAlign: 'center',
    minWidth: 200,
    title: $t('zen.service.dept.name'),
    treeNode: true,
  },
  {
    align: 'center',
    field: 'leaderId',
    formatter: ({ cellValue }) => getUserName(cellValue),
    minWidth: 150,
    title: $t('zen.service.dept.leader'),
  },
  {
    align: 'center',
    field: 'phone',
    formatter: ({ cellValue }) => cellValue || '-',
    minWidth: 150,
    title: $t('zen.service.dept.phone'),
  },
  {
    align: 'center',
    field: 'email',
    formatter: ({ cellValue }) => cellValue || '-',
    minWidth: 150,
    title: $t('zen.service.dept.email'),
  },
  {
    align: 'center',
    field: 'sort',
    minWidth: 80,
    title: $t('zen.service.dept.sort'),
  },
  {
    align: 'center',
    field: 'status',
    minWidth: 100,
    slots: { default: 'status' },
    title: $t('zen.service.dept.status'),
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
    auth: 'system:dept:create',
    icon: 'ep:plus',
    onClick: () => addModal.open(),
    title: $t('zen.common.create'),
    type: 'primary',
  },
]);

const tableOpts = reactive<VxeGridProps<DeptApi.Dept>>({
  customConfig: {},
  id: 'dept_manage',
  keyboardConfig: {
    isArrow: true,
    isBack: true,
    isEnter: true,
  },
  printConfig: {},
  proxyConfig: {
    ajax: {
      query: () => getDeptListApi(deptQuery),
    },
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

function createActions(row: DeptApi.Dept) {
  const actions: ActionItem[] = [
    ...(row.status === DictStatus.ENABLE
      ? [
          {
            auth: 'system:dept:create',
            icon: 'ep:plus',
            onClick: () => {
              addModal.setData({ parentId: row.id });
              addModal.open();
            },
            tooltip: {
              content: $t('zen.common.create'),
            },
          },
        ]
      : []),
    {
      auth: 'system:dept:update',
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
      auth: 'system:dept:delete',
      icon: 'ep:delete',
      popConfirm: {
        on: {
          confirm: () => {
            deleteDeptApi(row.id).then(() => {
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

  return actions;
}

function getUserName(id: number) {
  if (!userList.value) {
    return '-';
  }

  return userList.value.find((item) => item.id === id)?.nickname || '-';
}

function handleQuery(query: DeptApi.Query) {
  deptQuery = query;
  reloadTable();
}

async function reloadTable() {
  await vxeTable.value?.commitProxy('query');
  vxeTable.value?.setAllTreeExpand(true);
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
