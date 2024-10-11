<script setup lang="ts">
import { Page, useVbenModal } from '@vben/common-ui';

import dayjs from 'dayjs';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter';
import {
  batchDeleteTenantApi,
  deleteTenantApi,
  exportTenantApi,
  getTenantPackageSimpleListApi,
  getTenantPageListApi,
  type TenantApi,
} from '#/api';
import { type ActionItem, TableAction, TableExport } from '#/components';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import {
  downloadExcel,
  formatToDateTime,
  formatToThousand,
  useBatchSelect,
} from '#/utils';

import { TableAdd, TableEdit, TableQuery } from './components';

type TenantColumns = VxeGridProps<TenantApi.Tenant>['columns'];

const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS);

let tenantQuery: TenantApi.PageQuery = {};

const [TableAddModal, addModal] = useVbenModal({
  connectedComponent: TableAdd,
});

const [TableEditModal, editModal] = useVbenModal({
  connectedComponent: TableEdit,
});

const [TableExportModal, exportModal] = useVbenModal({
  connectedComponent: TableExport,
});

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

const columns: TenantColumns = [
  {
    fixed: 'left',
    type: 'checkbox',
    width: 50,
  },
  {
    field: 'id',
    minWidth: 80,
    title: $t('zen.service.tenant.code'),
  },
  {
    field: 'name',
    minWidth: 150,
    title: $t('zen.service.tenant.name'),
  },
  {
    field: 'packageId',
    minWidth: 120,
    slots: { default: 'package' },
    title: $t('zen.service.tenant.package'),
  },
  {
    field: 'contactName',
    minWidth: 100,
    title: $t('zen.service.tenant.contact'),
  },
  {
    field: 'contactMobile',
    minWidth: 120,
    title: $t('zen.service.tenant.contactPhone'),
  },
  {
    field: 'accountCount',
    formatter: ({ cellValue }) => formatToThousand(cellValue),
    minWidth: 150,
    sortable: true,
    title: $t('zen.service.tenant.accountLimit'),
  },
  {
    field: 'expireTime',
    minWidth: 150,
    slots: { default: 'expire' },
    sortable: true,
    title: $t('zen.service.tenant.expireTime'),
  },
  {
    field: 'website',
    minWidth: 150,
    slots: { default: 'website' },
    title: $t('zen.service.tenant.website'),
  },
  {
    field: 'status',
    minWidth: 100,
    slots: { default: 'status' },
    title: $t('zen.service.tenant.status'),
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

const gridOptions: VxeGridProps<TenantApi.Tenant> = {
  columns,
  checkboxConfig: {
    checkMethod: ({ row }) => row.packageId !== 0,
    highlight: true,
    range: true,
  },
  customConfig: {},
  id: 'tenant_list',
  height: 'auto',
  proxyConfig: {
    ajax: {
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
  },
  toolbarConfig: {
    refresh: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions: {}, gridOptions });

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:tenant:delete',
    icon: 'ep:delete',
    onClick: () => {
      useBatchSelect<TenantApi.Tenant>({
        gridApi,
        handleBatch: (records) =>
          batchDeleteTenantApi(records.map((item) => item.id)),
        query: tenantQuery,
      });
    },
    title: $t('zen.common.batchDelete'),
    type: 'danger',
  },
  {
    auth: 'system:tenant:create',
    icon: 'ep:plus',
    onClick: () => addModal.open(),
    title: $t('zen.common.create'),
    type: 'primary',
  },
  {
    auth: 'system:tenant:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    onClick: () => exportModal.open(),
    title: $t('zen.common.export'),
    type: 'warning',
  },
]);

function createActions(row: TenantApi.Tenant) {
  const disabled = row.packageId === 0;

  const actions: ActionItem[] = [
    {
      auth: 'system:tenant:update',
      disabled,
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
      auth: 'system:tenant:delete',
      disabled,
      icon: 'ep:delete',
      popConfirm: {
        on: {
          confirm: () => {
            deleteTenantApi(row.id).then(() => {
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

function isExpire(expireTime: number) {
  return dayjs(expireTime).isBefore();
}

function getPackageNameById(id: number) {
  if (id === 0) {
    return $t('zen.service.tenant.systemTenant');
  }

  return packageList.value.find((item) => item.id === id)?.name || '-';
}

async function handleExport(fileName: string) {
  if (exportLoading.value) {
    return;
  }
  const { data } = await exportTenant(tenantQuery);
  downloadExcel(data, fileName);
  exportModal.close();
  ElMessage.success($t('zen.export.success'));
}

function handleQuery(query: TenantApi.PageQuery) {
  tenantQuery = query;
  gridApi.query();
}

function reloadTable() {
  gridApi.reload(tenantQuery);
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

        <TableExportModal
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
    </Grid>
  </Page>
</template>
