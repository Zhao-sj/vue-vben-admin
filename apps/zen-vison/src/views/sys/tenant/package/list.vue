<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { TenantApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useGridHelper, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchDeleteTenantPackageApi,
  deleteTenantPackageApi,
  getTenantPackagePageListApi,
  updateTenantPackageStatusApi,
} from '#/api';
import { TableAction } from '#/components';
import { DictStatus } from '#/enums';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import { Form } from './modules';

const { isMobile } = useIsMobile();

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    collapsed: isMobile.value,
    commonConfig: {
      componentProps: {
        clearable: true,
      },
      labelWidth: 80,
    },
    schema: useGridFormSchema(),
    submitOnEnter: true,
    showCollapseButton: isMobile.value,
    wrapperClass: 'grid-cols-1 lg:grid-cols-4 2xl:grid-cols-5',
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange),
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
  } as VxeTableGridOptions<TenantApi.Package>,
});

const { batchSelect, onSuccess } = useGridHelper<TenantApi.Package>(gridApi);

const toolbarActions: ActionItem[] = [
  {
    auth: 'system:tenant-package:delete',
    icon: 'ep:delete',
    btnText: $t('page.delete'),
    onClick: () => {
      batchSelect({
        onBatchAction: (records) =>
          batchDeleteTenantPackageApi(records.map((item) => item.id)),
      });
    },
    type: 'danger',
  },
  {
    auth: 'system:tenant-package:create',
    icon: 'ep:plus',
    btnText: $t('page.create'),
    onClick: () => formDrawerApi.open(),
    type: 'primary',
  },
];

function onActionClick({ code, row }: OnActionClickParams<TenantApi.Package>) {
  switch (code) {
    case 'delete': {
      deleteTenantPackageApi(row.id).then(onSuccess);
      break;
    }
    case 'edit': {
      formDrawerApi.setData({ id: row.id });
      formDrawerApi.open();
      break;
    }
    default: {
      break;
    }
  }
}

async function onStatusChange(newStatus: number, row: TenantApi.Package) {
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
    await updateTenantPackageStatusApi({ id: row.id, status: newStatus });
    onSuccess(false);
    return true;
  } catch {
    return false;
  }
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onSuccess" />

    <Grid :table-title="$t('sys.tenant.package.list')">
      <template #toolbar-tools>
        <TableAction :actions="toolbarActions" />
      </template>
    </Grid>
  </Page>
</template>
