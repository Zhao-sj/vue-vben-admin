<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { DeptApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';
import { IconifyIcon } from '@vben/icons';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteDeptApi, getDeptListApi, getUserSimpleListApi } from '#/api';
import { TableAction } from '#/components';
import { DictStatus, DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

import { TableAdd, TableEdit } from './components';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS);

const { data: userList } = useRequest(getUserSimpleListApi);

const [TableAddModal, addModal] = useVbenModal({
  connectedComponent: TableAdd,
});

const [TableEditModal, editModal] = useVbenModal({
  connectedComponent: TableEdit,
});

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('sys.dept.name'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.STATUS),
    },
    fieldName: 'status',
    label: $t('sys.dept.status'),
  },
]);

const formOptions = computed<VbenFormProps>(() => ({
  collapsed: isMobile.value,
  commonConfig: {
    componentProps: {
      clearable: true,
    },
    labelWidth: 80,
  },
  schema: formSchema.value,
  submitOnEnter: true,
  showCollapseButton: isMobile.value,
  wrapperClass: 'grid-cols-1 lg:grid-cols-4 2xl:grid-cols-6',
}));

const columns: VxeGridProps<DeptApi.Dept>['columns'] = [
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
    minWidth: 150,
    title: $t('sys.dept.leader'),
    formatter: ({ cellValue }) => getUserName(cellValue),
  },
  {
    field: 'phone',
    minWidth: 150,
    title: $t('sys.dept.phone'),
    formatter: 'formatBlank',
  },
  {
    field: 'email',
    minWidth: 150,
    title: $t('sys.dept.email'),
    formatter: 'formatBlank',
  },
  {
    field: 'sort',
    minWidth: 80,
    title: $t('sys.dept.sort'),
  },
  {
    field: 'status',
    minWidth: 100,
    title: $t('sys.dept.status'),
    cellRender: {
      name: 'CellDict',
      props: {
        type: DictTypeEnum.STATUS,
      },
    },
  },
  {
    field: 'createTime',
    minWidth: 150,
    title: $t('page.createTime'),
    formatter: 'formatDateTime',
  },
  {
    field: 'opt',
    title: $t('page.options'),
    width: 120,
    fixed: isMobile.value ? null : 'right',
    slots: { default: 'opt' },
  },
];

const gridOptions: VxeGridProps<DeptApi.Dept> = {
  columns,
  id: 'dept_manage',
  keyboardConfig: {
    isArrow: true,
    isBack: true,
    isEnter: true,
  },
  proxyConfig: {
    ajax: {
      query: (_, formValues) => getDeptList(formValues),
    },
  },
  height: 'auto',
  stripe: false,
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

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

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

async function reloadTable() {
  const values = await gridApi.formApi.getValues();
  await gridApi.reload(values);
  gridApi.grid.setAllTreeExpand(true);
}

function toggleExpandAll() {
  const expandRecords = gridApi.grid.getTreeExpandRecords();
  gridApi.grid.setAllTreeExpand(expandRecords?.length === 0);
}
</script>

<template>
  <Page auto-content-height>
    <Grid :form-options="formOptions">
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
        <div>
          <ElButton
            :title="`${$t('page.expand')} / ${$t('page.collapsed')}`"
            circle
            plain
            @click="toggleExpandAll"
          >
            <IconifyIcon icon="ep:sort" />
          </ElButton>
        </div>
      </template>

      <template #opt="{ row }">
        <TableAction :actions="createActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
