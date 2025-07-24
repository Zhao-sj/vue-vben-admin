<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { LogApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { exporAccessLogApi, getAccessLogPageListApi } from '#/api';
import { TableAction, TableExport } from '#/components';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { downloadExcel } from '#/utils';
import { DeviceInfo } from '#/views/sys/log/components';

import { useColumns, useGridFormSchema } from './data';
import { Detail } from './modules';

const { isMobile } = useIsMobile();

const { loading: exportLoading, runAsync: exportLog } = useRequest(
  exporAccessLogApi,
  {
    loadingDelay: 200,
    manual: true,
  },
);

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: Detail,
  destroyOnClose: true,
});

const [ExportModal, exportModalApi] = useVbenModal({
  connectedComponent: TableExport,
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
    wrapperClass: 'grid-cols-1 lg:grid-cols-4 2xl:grid-cols-5',
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    id: 'log_access_manage',
    proxyConfig: {
      ajax: {
        query: ({ page }, formValues) =>
          getAccessLogPageListApi({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          }),
      },
    },
  } as VxeTableGridOptions<LogApi.Access>,
});

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:access-log:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    onClick: () => {
      exportModalApi.open();
    },
    btnText: $t('page.export.action'),
  },
]);

function onActionClick({ code, row }: OnActionClickParams<LogApi.Access>) {
  switch (code) {
    case 'detail': {
      detailDrawerApi.setData(row);
      detailDrawerApi.open();
      break;
    }
    default: {
      break;
    }
  }
}

async function onExport(fileName: string) {
  if (exportLoading.value) {
    return;
  }
  const values = await gridApi.formApi.getValues();
  const { data } = await exportLog(values);
  downloadExcel(data, fileName);
  exportModalApi.close();
  ElMessage.success($t('page.export.success'));
}
</script>

<template>
  <Page auto-content-height>
    <DetailDrawer />
    <ExportModal
      :default-name="$t('sys.log.access.list')"
      @confirm="onExport"
    />

    <Grid :table-title="$t('sys.log.access.list')">
      <template #toolbar-tools>
        <TableAction :actions="toolbarActions" />
      </template>

      <template #ua="{ row: { ua } }">
        <DeviceInfo :ua />
      </template>
    </Grid>
  </Page>
</template>
