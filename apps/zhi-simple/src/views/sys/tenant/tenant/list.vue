<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { TenantApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import dayjs from 'dayjs';

import { useGridHelper, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchDeleteTenantApi,
  deleteTenantApi,
  exportTenantApi,
  getTenantPackageSimpleListApi,
  getTenantPageListApi,
  updateTenantStatusApi,
} from '#/api';
import { TableAction, TableExport } from '#/components';
import { DictStatus } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { downloadExcel, formatToDateTime } from '#/utils';

import { useColumns, useGridFormSchema } from './data';
import { Form } from './modules';

const { isMobile } = useIsMobile();

const requestConfig = {
  loadingDelay: 200,
  manual: true,
};

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [ExportModal, exportModalApi] = useVbenModal({
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
    wrapperClass: 'grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4',
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange),
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
  } as VxeTableGridOptions<TenantApi.Tenant>,
});

const { batchSelect, onSuccess } = useGridHelper<TenantApi.Tenant>(gridApi);

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:tenant:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    onClick: () => exportModalApi.open(),
    btnText: $t('page.export.action'),
  },
  {
    auth: 'system:tenant:delete',
    icon: 'ep:delete',
    onClick: () => {
      batchSelect({
        onBatchAction: (records) =>
          batchDeleteTenantApi(records.map((item) => item.id)),
      });
    },
    btnText: $t('page.delete'),
    type: 'danger',
  },
  {
    auth: 'system:tenant:create',
    icon: 'ep:plus',
    onClick: () => formDrawerApi.open(),
    btnText: $t('page.create'),
    type: 'primary',
  },
]);

function onActionClick({ code, row }: OnActionClickParams<TenantApi.Tenant>) {
  switch (code) {
    case 'delete': {
      deleteTenantApi(row.id).then(onSuccess);
      break;
    }
    case 'edit': {
      formDrawerApi.setData(row);
      formDrawerApi.open();
      break;
    }
    default: {
      break;
    }
  }
}

async function onStatusChange(newStatus: number, row: TenantApi.Tenant) {
  const action =
    newStatus === DictStatus.ENABLE ? $t('page.enable') : $t('page.disable');

  const message = $t('page.actionConfirm.status', [
    action,
    row.name,
    $t('sys.tenant.list.title'),
  ]);

  try {
    await ElMessageBox.confirm(message, $t('page.systemTip'), {
      closeOnClickModal: false,
      draggable: true,
      type: 'warning',
    });
    await updateTenantStatusApi({ id: row.id, status: newStatus });
    onSuccess(false);
    return true;
  } catch {
    return false;
  }
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

async function onExport(fileName: string) {
  if (exportLoading.value) {
    return;
  }
  const values = await gridApi.formApi.getValues();
  const { data } = await exportTenant(values);
  downloadExcel(data, fileName);
  exportModalApi.close();
  ElMessage.success($t('page.export.success'));
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onSuccess" />
    <ExportModal
      :default-name="$t('sys.tenant.list.list')"
      @confirm="onExport"
    />

    <Grid :table-title="$t('sys.tenant.list.list')">
      <template #toolbar-tools>
        <TableAction :actions="toolbarActions" />
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
    </Grid>
  </Page>
</template>
