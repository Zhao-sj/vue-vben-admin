<script setup lang="ts">
import { Page, useVbenModal } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  deleteDeptApi,
  type DeptApi,
  getDeptListApi,
  getUserSimpleListApi,
} from '#/api';
import { type ActionItem, TableAction } from '#/components';
import { DictStatus, DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

import { TableAdd, TableEdit, TableQuery } from './components';

type DeptColumns = VxeGridProps<DeptApi.Dept>['columns'];

const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS);

let deptQuery: DeptApi.Query = {};

const { data: userList } = useRequest(getUserSimpleListApi);

const [TableAddModal, addModal] = useVbenModal({
  connectedComponent: TableAdd,
});

const [TableEditModal, editModal] = useVbenModal({
  connectedComponent: TableEdit,
});

const columns: DeptColumns = [
  {
    field: 'name',
    headerAlign: 'center',
    align: 'left',
    minWidth: 200,
    title: $t('sys.dept.name'),
    treeNode: true,
  },
  {
    field: 'leaderId',
    formatter: ({ cellValue }) => getUserName(cellValue),
    minWidth: 150,
    title: $t('sys.dept.leader'),
  },
  {
    field: 'phone',
    formatter: 'formatBlank',
    minWidth: 150,
    title: $t('sys.dept.phone'),
  },
  {
    field: 'email',
    formatter: 'formatBlank',
    minWidth: 150,
    title: $t('sys.dept.email'),
  },
  {
    field: 'sort',
    minWidth: 80,
    title: $t('sys.dept.sort'),
  },
  {
    field: 'status',
    minWidth: 100,
    slots: { default: 'status' },
    title: $t('sys.dept.status'),
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

const gridOptions: VxeGridProps<DeptApi.Dept> = {
  columns,
  customConfig: {},
  id: 'dept_manage',
  keyboardConfig: {
    isArrow: true,
    isBack: true,
    isEnter: true,
  },
  proxyConfig: {
    ajax: {
      query: () => getDeptList(deptQuery),
    },
  },
  height: 'auto',
  stripe: false,
  toolbarConfig: {
    refresh: true,
  },
  pagerConfig: {
    enabled: false,
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
    auth: 'system:dept:create',
    icon: 'ep:plus',
    onClick: () => addModal.open(),
    title: $t('page.create'),
    type: 'primary',
  },
]);

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
              content: $t('page.create'),
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
        content: $t('page.edit'),
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

  return actions;
}

async function getDeptList(deptQuery: DeptApi.Query) {
  const list = await getDeptListApi(deptQuery);
  return { list };
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
  await gridApi.reload(deptQuery);
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
