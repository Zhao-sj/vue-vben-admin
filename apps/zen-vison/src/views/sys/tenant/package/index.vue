<script setup lang="ts">
import type { VxeGridProps } from 'vxe-table';

import { type ModalApiOptions, useVbenModal } from '@vben/common-ui';

import {
  batchDeleteTenantPackageApi,
  deleteTenantPackageApi,
  getTenantPackagePageListApi,
  type TenantApi,
} from '#/api';
import { type ActionItem, TableAction, VxeBasicTable } from '#/components';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { formatToDateTime } from '#/utils';

import { TableAdd, TableEdit, TableQuery } from './components';

type PackageColumns = VxeGridProps<TenantApi.Package>['columns'];

const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS);

let packageQuery: TenantApi.PackagePageQuery = {};
const vxeBasicTableRef = ref<InstanceType<typeof VxeBasicTable>>();

const modalOpts: ModalApiOptions = {
  closeOnClickModal: false,
  draggable: true,
};

const [TableAddModal, addModal] = useVbenModal({
  connectedComponent: TableAdd,
  ...modalOpts,
});

const [TableEditModal, editModal] = useVbenModal({
  connectedComponent: TableEdit,
  ...modalOpts,
});

const vxeTable = computed(() =>
  vxeBasicTableRef.value?.getTableInstance<TenantApi.Package>(),
);

const columns = computed<PackageColumns>(() => [
  {
    align: 'center',
    fixed: 'left',
    type: 'checkbox',
    width: 50,
  },
  {
    align: 'center',
    field: 'id',
    minWidth: 80,
    title: $t('zen.service.package.code'),
  },
  {
    align: 'center',
    field: 'name',
    minWidth: 150,
    title: $t('zen.service.package.name'),
  },
  {
    align: 'center',
    field: 'status',
    minWidth: 100,
    slots: { default: 'status' },
    title: $t('zen.service.package.status'),
  },
  {
    align: 'center',
    field: 'remark',
    formatter: ({ cellValue }) => cellValue || '-',
    minWidth: 100,
    title: $t('zen.service.package.remark'),
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
    auth: 'system:tenant-package:delete',
    icon: 'ep:delete',
    onClick: () => {
      vxeTable.value?.commitProxy('delete');
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

const tableOpts = reactive<VxeGridProps<TenantApi.Package>>({
  checkboxConfig: {
    highlight: true,
    range: true,
  },
  customConfig: {},
  id: 'tenant_package',
  pagerConfig: {
    pageSize: 20,
  },
  printConfig: {},
  proxyConfig: {
    ajax: {
      delete: ({ body: { removeRecords } }) => {
        const ids = removeRecords.map((item) => item.id);
        return batchDeleteTenantPackageApi(ids);
      },
      query: ({ page: { currentPage, pageSize } }) =>
        getTenantPackagePageListApi({
          pageNum: currentPage,
          pageSize,
          ...packageQuery,
        }),
    },
    response: {
      result: 'list',
      total: 'total',
    },
  },
  toolbarConfig: {
    print: true,
    refresh: true,
    slots: {
      buttons: 'toolbar_left',
    },
  },
});

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
  vxeTable.value?.commitProxy('query');
}

function reloadTable() {
  vxeTable.value?.commitProxy('reload');
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
