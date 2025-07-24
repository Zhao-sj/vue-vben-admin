<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { ZDPortalApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useGridHelper, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchUpdateZeroadConsultApi,
  exporZeroadConsultApi,
  getZeroadConsultPageApi,
  updateZeroadConsultStatusApi,
} from '#/api';
import { TableAction, TableExport } from '#/components';
import { DictConsultAccept } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { downloadExcel } from '#/utils';

import { useColumns, useGridFormSchema } from './data';

const { isMobile } = useIsMobile();

const { loading: exportLoading, runAsync: exportLog } = useRequest(
  exporZeroadConsultApi,
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
    showCollapseButton: isMobile.value,
    wrapperClass: 'grid-cols-1 lg:grid-cols-3 2xl:grid-cols-5',
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    checkboxConfig: {
      checkMethod: ({ row }) =>
        row.processStatus === DictConsultAccept.UN_ACCEPT,
      highlight: true,
      range: true,
    },
    id: 'portal_consult_manage',
    proxyConfig: {
      ajax: {
        query: ({ page }, formValues) =>
          getZeroadConsultPageApi({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          }),
      },
    },
  } as VxeTableGridOptions<ZDPortalApi.Consult>,
});

const { batchSelect, onSuccess } = useGridHelper<ZDPortalApi.Consult>(gridApi);

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'portal:consult:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    btnText: $t('page.export.action'),
    onClick: () => exportModalApi.open(),
  },
  {
    auth: 'portal:consult:update-status',
    icon: 'ep:close',
    btnText: $t('portal.consult.ignored'),
    onClick: () => {
      onBatchProcess(DictConsultAccept.IGNORE);
    },
    type: 'danger',
  },
  {
    auth: 'portal:consult:update-status',
    icon: 'ep:check',
    btnText: $t('portal.consult.processed'),
    onClick: () => {
      onBatchProcess(DictConsultAccept.ACCEPT);
    },
    type: 'success',
  },
]);

function onActionClick({
  code,
  row,
}: OnActionClickParams<ZDPortalApi.Consult>) {
  switch (code) {
    case 'accept': {
      updateZeroadConsultStatusApi({
        id: row.id,
        processStatus: DictConsultAccept.ACCEPT,
      }).then(onSuccess);
      break;
    }
    case 'ignore': {
      updateZeroadConsultStatusApi({
        id: row.id,
        processStatus: DictConsultAccept.IGNORE,
      }).then(onSuccess);
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

function onBatchProcess(status: DictConsultAccept) {
  batchSelect({
    actionType: $t('page.update'),
    onBatchAction: (records) =>
      batchUpdateZeroadConsultApi({
        ids: records.map((item) => item.id),
        processStatus: status,
      }),
  });
}
</script>

<template>
  <Page auto-content-height>
    <ExportModal
      :default-name="$t('portal.consult.list')"
      @confirm="onExport"
    />

    <Grid :table-title="$t('portal.consult.list')">
      <template #toolbar-tools>
        <TableAction :actions="toolbarActions" />
      </template>
    </Grid>
  </Page>
</template>
