<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { TenantApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchDeleteTenantApi,
  deleteTenantApi,
  exportTenantApi,
  getTenantPackageSimpleListApi,
  getTenantPageListApi,
} from '#/api';
import { TableAction, TableExport } from '#/components';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { downloadExcel, formatToDateTime, useBatchSelect } from '#/utils';

import { TableAdd, TableEdit } from './components';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS);

const requestConfig = {
  loadingDelay: 200,
  manual: true,
};

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
  requestConfig,
);

const { loading: exportLoading, runAsync: exportTenant } = useRequest(
  exportTenantApi,
  requestConfig,
);

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('sys.tenant.list.name'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.STATUS),
    },
    fieldName: 'status',
    label: $t('sys.tenant.list.status'),
  },
  {
    component: 'Input',
    fieldName: 'contactName',
    label: $t('sys.tenant.list.contact'),
  },
  {
    component: 'Input',
    fieldName: 'contactMobile',
    label: $t('sys.tenant.list.contactPhone'),
  },
  {
    component: 'DatePicker',
    componentProps: {
      placeholder: $t('page.date.placeholder.between'),
      range: true,
      multiCalendars: {
        solo: true,
      },
    },
    fieldName: 'createTime',
    label: $t('page.createTime'),
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
  wrapperClass: 'grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4',
}));

const columns: VxeGridProps<TenantApi.Tenant>['columns'] = [
  {
    type: 'checkbox',
    width: 50,
    fixed: isMobile.value ? null : 'left',
  },
  {
    field: 'id',
    minWidth: 80,
    title: $t('sys.tenant.list.id'),
  },
  {
    field: 'name',
    minWidth: 150,
    title: $t('sys.tenant.list.name'),
  },
  {
    field: 'packageId',
    minWidth: 120,
    title: $t('sys.tenant.list.package'),
    slots: { default: 'package' },
  },
  {
    field: 'contactName',
    minWidth: 100,
    title: $t('sys.tenant.list.contact'),
  },
  {
    field: 'contactMobile',
    minWidth: 120,
    title: $t('sys.tenant.list.contactPhone'),
    formatter: 'formatBlank',
  },
  {
    field: 'accountCount',
    minWidth: 150,
    title: $t('sys.tenant.list.accountLimit'),
    formatter: 'formatThousand',
    sortable: true,
  },
  {
    field: 'expireTime',
    minWidth: 150,
    title: $t('sys.tenant.list.expireTime'),
    slots: { default: 'expire' },
    sortable: true,
  },
  {
    field: 'website',
    minWidth: 200,
    title: $t('sys.tenant.list.website'),
    cellRender: { name: 'CellLink' },
  },
  {
    field: 'status',
    minWidth: 100,
    title: $t('sys.tenant.list.status'),
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

const gridOptions: VxeGridProps<TenantApi.Tenant> = {
  columns,
  checkboxConfig: {
    checkMethod: ({ row }) => row.packageId !== 0,
    highlight: true,
    range: true,
  },
  id: 'tenant_list',
  height: 'auto',
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        if (!packageList.value) {
          await getPackageList();
        }
        return getTenantPageListApi({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:tenant:delete',
    icon: 'ep:delete',
    onClick: async () => {
      const values = await gridApi.formApi.getValues();
      useBatchSelect<TenantApi.Tenant>({
        gridApi,
        handleBatch: (records) =>
          batchDeleteTenantApi(records.map((item) => item.id)),
        query: values,
      });
    },
    title: $t('page.batchDelete'),
    type: 'danger',
  },
  {
    auth: 'system:tenant:create',
    icon: 'ep:plus',
    onClick: () => addModal.open(),
    title: $t('page.create'),
    type: 'primary',
  },
  {
    auth: 'system:tenant:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    onClick: () => exportModal.open(),
    title: $t('page.export.title'),
    type: 'warning',
  },
]);

function createActions(row: TenantApi.Tenant) {
  const disabled = row.packageId === 0;

  const actions: ActionItem[] = [
    {
      auth: 'system:tenant:update',
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
      auth: 'system:tenant:delete',
      disabled,
      icon: 'ep:delete',
      popConfirm: {
        on: {
          confirm: () => {
            deleteTenantApi(row.id).then(() => {
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

function isExpire(expireTime: number) {
  return dayjs(expireTime).isBefore();
}

function getPackageNameById(id: number) {
  if (id === 0) {
    return $t('sys.tenant.list.systemTenant');
  }

  return packageList.value.find((item) => item.id === id)?.name || '-';
}

async function handleExport(fileName: string) {
  if (exportLoading.value) {
    return;
  }
  const values = await gridApi.formApi.getValues();
  const { data } = await exportTenant(values);
  downloadExcel(data, fileName);
  exportModal.close();
  ElMessage.success($t('page.export.success'));
}

async function reloadTable() {
  const values = await gridApi.formApi.getValues();
  gridApi.reload(values);
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

        <TableExportModal
          :default-name="$t('sys.tenant.list.title')"
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

      <template #opt="{ row }">
        <TableAction :actions="createActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
