<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { TenantApi } from '#/api';
import type { ActionItem } from '#/components';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchDeleteTenantPackageApi,
  deleteTenantPackageApi,
  getTenantPackagePageListApi,
  updateTenantPackageStatusApi,
} from '#/api';
import { TableAction } from '#/components';
import { DictStatus, DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { useBatchSelect } from '#/utils';

import { TableAdd, TableEdit } from './modules';

const { isMobile } = useIsMobile();
const { hasAccessByCodes } = useAccess();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS);

const requestConfig = {
  loadingDelay: 200,
  manual: true,
};

const { runAsync: updateStatus } = useRequest(
  updateTenantPackageStatusApi,
  requestConfig,
);

const [TableAddDrawer, addDrawerApi] = useVbenDrawer({
  connectedComponent: TableAdd,
});

const [TableEditDrawer, editDrawerApi] = useVbenDrawer({
  connectedComponent: TableEdit,
});

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('sys.tenant.package.name'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.STATUS),
    },
    fieldName: 'status',
    label: $t('sys.tenant.package.status'),
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
  showCollapseButton: isMobile.value,
  wrapperClass: 'grid-cols-1 lg:grid-cols-4 2xl:grid-cols-5',
}));

const columns: VxeTableGridOptions<TenantApi.Package>['columns'] = [
  {
    type: 'checkbox',
    width: 50,
    fixed: isMobile.value ? null : 'left',
  },
  {
    field: 'id',
    minWidth: 80,
    title: $t('sys.tenant.package.id'),
  },
  {
    field: 'name',
    minWidth: 150,
    title: $t('sys.tenant.package.name'),
  },
  {
    field: 'status',
    minWidth: 100,
    title: $t('sys.tenant.package.status'),
    cellRender: {
      name: 'CellSwitch',
      props: { disabled: !hasAccessByCodes(['system:tenant-package:update']) },
      attrs: { beforeChange: handleStatusChange },
    },
  },
  {
    field: 'remark',
    formatter: 'formatBlank',
    minWidth: 150,
    title: $t('sys.tenant.package.remark'),
  },
  {
    field: 'createTime',
    formatter: 'formatDateTime',
    minWidth: 150,
    title: $t('page.createTime'),
  },
  {
    field: 'opt',
    title: $t('page.options'),
    width: 180,
    slots: { default: 'opt' },
    fixed: isMobile.value ? null : 'right',
  },
];

const gridOptions: VxeTableGridOptions<TenantApi.Package> = {
  columns,
  checkboxConfig: {
    highlight: true,
    range: true,
  },
  id: 'tenant_package',
  height: 'auto',
  proxyConfig: {
    ajax: {
      query: ({ page }, formValues) =>
        getTenantPackagePageListApi({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        }),
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:tenant-package:delete',
    icon: 'ep:delete',
    btnText: $t('page.delete'),
    onClick: async () => {
      const values = await gridApi.formApi.getValues();
      useBatchSelect<TenantApi.Package>({
        gridApi,
        handleBatch: (records) =>
          batchDeleteTenantPackageApi(records.map((item) => item.id)),
        query: values,
      });
    },
    type: 'danger',
  },
  {
    auth: 'system:tenant-package:create',
    icon: 'ep:plus',
    btnText: $t('page.create'),
    onClick: () => addDrawerApi.open(),
    type: 'primary',
  },
]);

function createActions(row: TenantApi.Package) {
  const actions: ActionItem[] = [
    {
      auth: 'system:tenant-package:update',
      icon: 'ep:edit',
      btnText: $t('page.edit'),
      onClick: () => {
        editDrawerApi.setData({ id: row.id });
        editDrawerApi.open();
      },
      type: 'primary',
    },
    {
      auth: 'system:tenant-package:delete',
      icon: 'ep:delete',
      btnText: $t('page.delete'),
      popConfirm: {
        on: {
          confirm: () => {
            deleteTenantPackageApi(row.id).then(() => {
              ElMessage.success($t('page.success'));
              reloadTable();
            });
          },
        },
        title: $t('page.confirmDelete'),
      },
      type: 'danger',
    },
  ];

  return actions;
}

async function handleStatusChange(newStatus: number, row: TenantApi.Package) {
  const action =
    newStatus === DictStatus.ENABLE ? $t('page.enable') : $t('page.disable');

  const message = $t('page.actionConfirm.status', [
    action,
    row.name,
    $t('sys.tenant.package.title'),
  ]);

  try {
    await ElMessageBox.confirm(message, $t('page.systemTip'), {
      closeOnClickModal: false,
      draggable: true,
      type: 'warning',
    });
    await updateStatus({ id: row.id, status: newStatus });
    requestAfter(false);
    return true;
  } catch {
    return false;
  }
}

function requestAfter(reload = true) {
  ElMessage.success($t('page.success'));
  reload && reloadTable();
}

async function reloadTable() {
  const values = await gridApi.formApi.getValues();
  gridApi.reload(values);
}
</script>

<template>
  <Page auto-content-height>
    <Grid
      :table-title="$t('sys.tenant.package.list')"
      :form-options="formOptions"
    >
      <template #toolbar-tools>
        <TableAction
          :actions="toolbarActions"
          :link="false"
          :show-empty="false"
        />

        <TableAddDrawer @success="reloadTable" />
        <TableEditDrawer @success="reloadTable" />
      </template>

      <template #opt="{ row }">
        <TableAction :actions="createActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
