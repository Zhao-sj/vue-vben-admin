<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { LogApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useGridHelper, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchUpdateErrorLogStatusApi,
  exporErrorLogApi,
  getErrorLogPageListApi,
  updateErrorLogStatusApi,
} from '#/api';
import { TableAction, TableExport } from '#/components';
import { DictLogProcess } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { downloadExcel } from '#/utils';

import { useColumns, useGridFormSchema } from './data';
import { Detail } from './modules';

const { isMobile } = useIsMobile();

const { loading: exportLoading, runAsync: exportLog } = useRequest(
  exporErrorLogApi,
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
    checkboxConfig: {
      checkMethod: ({ row }) => row.processStatus === DictLogProcess.UN_PROCESS,
      highlight: true,
      range: true,
    },
    id: 'log_error_manage',
    proxyConfig: {
      ajax: {
        query: ({ page }, formValues) =>
          getErrorLogPageListApi({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          }),
      },
    },
  } as VxeTableGridOptions<LogApi.Error>,
});

const { batchSelect, onSuccess } = useGridHelper<LogApi.Error>(gridApi);

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:error-log:update-status',
    icon: 'ep:close',
    btnText: $t('sys.log.error.ignored'),
    onClick: () => {
      onBatchProcess(DictLogProcess.IGNORE);
    },
    type: 'danger',
  },
  {
    auth: 'system:error-log:update-status',
    icon: 'ep:check',
    btnText: $t('sys.log.error.processed'),
    onClick: () => {
      onBatchProcess(DictLogProcess.PROCESSED);
    },
    type: 'success',
  },
  {
    auth: 'system:error-log:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    btnText: $t('page.export.action'),
    onClick: () => {
      exportModalApi.open();
    },
  },
]);

function onActionClick({ code, row }: OnActionClickParams<LogApi.Error>) {
  switch (code) {
    case 'detail': {
      detailDrawerApi.setData(row);
      detailDrawerApi.open();
      break;
    }
    case 'ignore': {
      updateErrorLogStatusApi({
        id: row.id,
        processStatus: DictLogProcess.IGNORE,
      }).then(onSuccess);
      break;
    }
    case 'process': {
      updateErrorLogStatusApi({
        id: row.id,
        processStatus: DictLogProcess.PROCESSED,
      }).then(onSuccess);
      break;
    }
    default: {
      break;
    }
  }
}

function onBatchProcess(status: DictLogProcess) {
  batchSelect({
    actionType: $t('page.update'),
    onBatchAction: (records) =>
      batchUpdateErrorLogStatusApi({
        ids: records.map((item) => item.id),
        processStatus: status,
      }),
  });
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
    <ExportModal :default-name="$t('sys.log.error.list')" @confirm="onExport" />

    <Grid :table-title="$t('sys.log.error.list')">
      <template #toolbar-tools>
        <TableAction :actions="toolbarActions" />
      </template>
    </Grid>
  </Page>
</template>
