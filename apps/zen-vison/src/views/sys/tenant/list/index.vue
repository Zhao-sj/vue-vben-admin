<script setup lang="ts">
import dayjs from 'dayjs';
import { type VxeGridProps } from 'vxe-table';

import {
  batchDeleteTenantApi,
  deleteTenantApi,
  exportTenantApi,
  getTenantApi,
  getTenantPackageSimpleListApi,
  getTenantPageListApi,
  type TenantApi,
} from '#/api';
import {
  type ActionItem,
  TableAction,
  TableExport,
  VxeBasicTable,
} from '#/components';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { downloadExcel, formatToDateTime, formatToThousand } from '#/utils';

import { TableAdd, TableEdit, TableQuery } from './components';

type TenantColumns = VxeGridProps<TenantApi.Tenant>['columns'];

const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS);

let tenantQuery: TenantApi.PageQuery = {};
const vxeBasicTableRef = ref<InstanceType<typeof VxeBasicTable>>();
const tempData = ref<TenantApi.Tenant>();
const showAddDialog = ref(false);
const showEditDialog = ref(false);
const showExportDialog = ref(false);

const { data: packageList, runAsync: getPackageList } = useRequest(
  getTenantPackageSimpleListApi,
  {
    manual: true,
  },
);

const { loading: exportLoading, runAsync: exportTenant } = useRequest(
  exportTenantApi,
  {
    manual: true,
  },
);

const { loading, runAsync: getTenant } = useRequest(getTenantApi, {
  loadingDelay: 200,
  manual: true,
});

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
    title: $t('zen.service.tenant.code'),
  },
  {
    align: 'center',
    field: 'name',
    minWidth: 150,
    title: $t('zen.service.tenant.name'),
  },
  {
    align: 'center',
    field: 'packageId',
    minWidth: 120,
    slots: { default: 'package' },
    title: $t('zen.service.tenant.package'),
  },
  {
    align: 'center',
    field: 'contactName',
    minWidth: 100,
    title: $t('zen.service.tenant.contact'),
  },
  {
    align: 'center',
    field: 'contactMobile',
    minWidth: 120,
    title: $t('zen.service.tenant.contactPhone'),
  },
  {
    align: 'center',
    field: 'accountCount',
    formatter: ({ cellValue }) => formatToThousand(cellValue),
    minWidth: 150,
    sortable: true,
    title: $t('zen.service.tenant.accountLimit'),
  },
  {
    align: 'center',
    field: 'expireTime',
    minWidth: 150,
    slots: { default: 'expire' },
    sortable: true,
    title: $t('zen.service.tenant.expireTime'),
  },
  {
    align: 'center',
    field: 'website',
    minWidth: 150,
    slots: { default: 'website' },
    title: $t('zen.service.tenant.website'),
  },
  {
    align: 'center',
    field: 'status',
    minWidth: 100,
    slots: { default: 'status' },
    title: $t('zen.service.tenant.status'),
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
    auth: 'system:tenant:delete',
    icon: 'ep:delete',
    onClick: () => {
      vxeTable.value?.commitProxy('delete');
    },
    title: $t('zen.common.batchDelete'),
    type: 'danger',
  },
  {
    auth: 'system:tenant:create',
    icon: 'ep:plus',
    onClick: () => {
      showAddDialog.value = true;
    },
    title: $t('zen.common.create'),
    type: 'primary',
  },
  {
    auth: 'system:tenant:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    onClick: () => {
      showExportDialog.value = true;
    },
    title: $t('zen.common.export'),
    type: 'warning',
  },
]);

const tableOpts = reactive<VxeGridProps<TenantApi.Tenant>>({
  checkboxConfig: {
    checkMethod: ({ row }) => row.packageId !== 0,
    highlight: true,
    range: true,
  },
  id: 'tenant_list',
  pagerConfig: {
    pageSize: 20,
  },
  printConfig: {},
  proxyConfig: {
    ajax: {
      delete: ({ body: { removeRecords } }) => {
        const ids = removeRecords.map((item) => item.id);
        return batchDeleteTenantApi(ids);
      },
      query: async ({ page: { currentPage, pageSize } }) => {
        if (!packageList.value) {
          await getPackageList();
        }
        return getTenantPageListApi({
          pageNum: currentPage,
          pageSize,
          ...tenantQuery,
        });
      },
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
      auth: 'system:tenant:update',
      disabled,
      icon: 'ep:edit',
      onClick: async () => {
        const tenant = await getTenant(row.id);
        tempData.value = tenant;
        showEditDialog.value = true;
      },
      tooltip: {
        content: $t('zen.common.edit'),
      },
      type: 'primary',
    },
    {
      auth: 'system:tenant:delete',
      disabled,
      icon: 'ep:delete',
      popConfirm: {
        on: {
          confirm: () => {
            deleteTenantApi(row.id).then(() => {
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

function isExpire(expireTime: number) {
  return dayjs(expireTime).isBefore();
}

function getPackageNameById(id: number) {
  if (id === 0) {
    return $t('zen.service.tenant.systemTenant');
  }

  return packageList.value.find((item) => item.id === id)?.name || '-';
}

function handleQuery(query: TenantApi.PageQuery) {
  tenantQuery = query;
  vxeTable.value?.commitProxy('query');
}

async function handleExport(fileName: string) {
  const { data } = await exportTenant(tenantQuery);
  downloadExcel(data, fileName);
  ElMessage.success($t('zen.export.success'));
}
</script>

<template>
  <VxeBasicTable
    ref="vxeBasicTableRef"
    :columns="columns"
    v-loading="loading"
    v-bind="tableOpts"
  >
    <template #form>
      <TableQuery @query="handleQuery" />
    </template>

    <template #toolbar_left>
      <TableAction :actions="toolbarActions" :link="false" circle />

      <TableAdd
        v-model="showAddDialog"
        :packages="packageList"
        @success="vxeTable?.commitProxy('reload')"
      />

      <TableEdit
        v-model="showEditDialog"
        :data="tempData"
        :packages="packageList"
        @success="vxeTable?.commitProxy('reload')"
      />

      <TableExport
        v-model="showExportDialog"
        :default-name="$t('zen.menu.manage.tenantList')"
        @confirm="handleExport"
      />
    </template>

    <template #package="{ row: { packageId } }">
      <ElTag :type="packageId === 0 ? 'danger' : 'success'">
        {{ getPackageNameById(packageId) }}
      </ElTag>
    </template>

    <template #expire="{ row: { expireTime } }">
      <ElText
        :class="{ 'line-through': isExpire(expireTime) }"
        :type="isExpire(expireTime) ? 'info' : undefined"
      >
        {{ formatToDateTime(expireTime) }}
      </ElText>
    </template>

    <template #website="{ row: { website } }">
      <ElLink v-if="website" :href="website" target="_blank" type="primary">
        {{ website }}
      </ElLink>
      <span v-else>-</span>
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
