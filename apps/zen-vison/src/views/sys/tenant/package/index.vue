<script setup lang="ts">
import type { VxeGridProps } from 'vxe-table';

import {
  batchDeleteTenantPackageApi,
  deleteTenantPackageApi,
  getMenuSimpleListApi,
  getTenantPackageApi,
  getTenantPackagePageListApi,
  type TenantApi,
} from '#/api';
import { type ActionItem, TableAction, VxeBasicTable } from '#/components';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { formatToDateTime } from '#/utils';

import { TableAdd, TableEdit, TableQuery } from './components';

type TenantColumns = VxeGridProps<TenantApi.Package>['columns'];

const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS);

let packageQuery: TenantApi.PackagePageQuery = {};
const vxeBasicTableRef = ref<InstanceType<typeof VxeBasicTable>>();
const tempData = ref<TenantApi.Package>();
const showAddDialog = ref(false);
const showEditDialog = ref(false);

const requestConfig = {
  loadingDelay: 200,
  manual: true,
};

const { loading, runAsync: getPackage } = useRequest(
  getTenantPackageApi,
  requestConfig,
);

const {
  data: menus,
  loading: menuLoading,
  runAsync: getMenu,
} = useRequest(getMenuSimpleListApi, requestConfig);

const vxeTable = computed(() =>
  vxeBasicTableRef.value?.getTableInstance<TenantApi.Tenant>(),
);

const columns = computed<TenantColumns>(() => [
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
    onClick: async () => {
      await getMenu();
      showAddDialog.value = true;
    },
    title: $t('zen.common.create'),
    type: 'primary',
  },
]);

const tableOpts = reactive<VxeGridProps<TenantApi.Package>>({
  checkboxConfig: {
    highlight: true,
    range: true,
  },
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

function createActions(row: TenantApi.Tenant) {
  const disabled = row.packageId === 0;

  const actions: ActionItem[] = [
    {
      auth: 'system:tenant-package:update',
      disabled,
      icon: 'ep:edit',
      onClick: async () => {
        const [tentantPackage] = await Promise.all([
          getPackage(row.id),
          getMenu(),
        ]);
        tempData.value = tentantPackage;
        showEditDialog.value = true;
      },
      tooltip: {
        content: $t('zen.common.edit'),
      },
      type: 'primary',
    },
    {
      auth: 'system:tenant-package:delete',
      disabled,
      icon: 'ep:delete',
      popConfirm: {
        on: {
          confirm: () => {
            deleteTenantPackageApi(row.id).then(() => {
              ElMessage.success($t('zen.common.successTip'));
              vxeTable.value?.commitProxy('reload');
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
</script>

<template>
  <VxeBasicTable
    ref="vxeBasicTableRef"
    :columns="columns"
    v-loading="loading || menuLoading"
    v-bind="tableOpts"
  >
    <template #form>
      <TableQuery @query="handleQuery" />

      <TableAdd
        v-model="showAddDialog"
        :menus
        @success="vxeTable?.commitProxy('reload')"
      />

      <TableEdit
        v-model="showEditDialog"
        :data="tempData"
        :menus
        @success="vxeTable?.commitProxy('reload')"
      />
    </template>

    <template #toolbar_left>
      <TableAction :actions="toolbarActions" :link="false" circle />
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
