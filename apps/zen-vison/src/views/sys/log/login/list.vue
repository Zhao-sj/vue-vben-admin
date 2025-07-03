<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { LogApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { exporLoginLogApi, getLoginLogPageListApi } from '#/api';
import { TableAction, TableExport } from '#/components';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { downloadExcel } from '#/utils';
import { DeviceInfo } from '#/views/sys/log/components';

import { useColumns, useGridFormSchema } from './data';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.LOGIN_TYPE, DictTypeEnum.LOGIN_RESULT);

const { loading: exportLoading, runAsync: exportLog } = useRequest(
  exporLoginLogApi,
  {
    loadingDelay: 200,
    manual: true,
  },
);

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
    wrapperClass: 'grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4',
  },
  gridOptions: {
    columns: useColumns(),
    height: 'auto',
    id: 'log_login_manage',
    proxyConfig: {
      ajax: {
        query: ({ page }, formValues) =>
          getLoginLogPageListApi({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          }),
      },
    },
  } as VxeTableGridOptions<LogApi.Login>,
});

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:login-log:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    btnText: $t('page.export.action'),
    onClick: () => exportModalApi.open(),
  },
]);

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
    <ExportModal :default-name="$t('sys.log.login.list')" @confirm="onExport" />

    <Grid :table-title="$t('sys.log.login.list')">
      <template #toolbar-tools>
        <TableAction :actions="toolbarActions" />
      </template>

      <template #ua="{ row: { ua } }">
        <DeviceInfo :ua />
      </template>
    </Grid>
  </Page>
</template>
