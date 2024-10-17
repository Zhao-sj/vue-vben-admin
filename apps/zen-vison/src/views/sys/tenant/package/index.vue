<script setup lang="ts">
import { Page, useVbenModal } from '@vben/common-ui';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  batchDeleteTenantPackageApi,
  deleteTenantPackageApi,
  getTenantPackagePageListApi,
  type TenantApi,
} from '#/api';
import { type ActionItem, TableAction } from '#/components';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { useBatchSelect } from '#/utils';

import { TableAdd, TableEdit, TableQuery } from './components';

type PackageColumns = VxeGridProps<TenantApi.Package>['columns'];

const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS);

let packageQuery: TenantApi.PackagePageQuery = {};

const [TableAddModal, addModal] = useVbenModal({
  connectedComponent: TableAdd,
});

const [TableEditModal, editModal] = useVbenModal({
  connectedComponent: TableEdit,
});

const columns: PackageColumns = [
  {
    fixed: 'left',
    type: 'checkbox',
    width: 50,
  },
  {
    field: 'id',
    minWidth: 80,
    title: $t('zen.service.package.code'),
  },
  {
    field: 'name',
    minWidth: 150,
    title: $t('zen.service.package.name'),
  },
  {
    field: 'status',
    minWidth: 100,
    slots: { default: 'status' },
    title: $t('zen.service.package.status'),
  },
  {
    field: 'remark',
    formatter: ({ cellValue }) => cellValue || '-',
    minWidth: 150,
    title: $t('zen.service.package.remark'),
  },
  {
    field: 'createTime',
    formatter: 'formatDateTime',
    minWidth: 150,
    title: $t('zen.common.createTime'),
  },
  {
    fixed: 'right',
    slots: { default: 'opt' },
    title: $t('zen.common.opt'),
    width: 120,
  },
];

const gridOptions: VxeGridProps<TenantApi.Package> = {
  columns,
  checkboxConfig: {
    highlight: true,
    range: true,
  },
  customConfig: {},
  id: 'tenant_package',
  height: 'auto',
  proxyConfig: {
    ajax: {
      query: ({ page: { currentPage, pageSize } }) =>
        getTenantPackagePageListApi({
          pageNum: currentPage,
          pageSize,
          ...packageQuery,
        }),
    },
  },
  toolbarConfig: {
    refresh: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions: {}, gridOptions });

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:tenant-package:delete',
    icon: 'ep:delete',
    onClick: () => {
      useBatchSelect<TenantApi.Package>({
        gridApi,
        handleBatch: (records) =>
          batchDeleteTenantPackageApi(records.map((item) => item.id)),
        query: packageQuery,
      });
    },
    title: $t('zen.common.batchDelete'),
    type: 'danger',
  },
  {
    auth: 'system:tenant-package:create',
    icon: 'ep:plus',
    onClick: () => addModal.open(),
    title: $t('zen.common.create'),
    type: 'primary',
  },
]);

function createActions(row: TenantApi.Package) {
  const actions: ActionItem[] = [
    {
      auth: 'system:tenant-package:update',
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
      auth: 'system:tenant-package:delete',
      icon: 'ep:delete',
      popConfirm: {
        on: {
          confirm: () => {
            deleteTenantPackageApi(row.id).then(() => {
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

function handleQuery(query: TenantApi.PackagePageQuery) {
  packageQuery = query;
  gridApi.query();
}

function reloadTable() {
  gridApi.query(packageQuery);
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
