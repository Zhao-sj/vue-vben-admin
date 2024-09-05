<script setup lang="ts">
import type { VxeGridProps } from 'vxe-table';

import { useVbenModal } from '@vben/common-ui';

import {
  batchUpdateErrorLogStatusApi,
  exporErrorLogApi,
  getErrorLogPageListApi,
  type LogApi,
  updateErrorLogStatusApi,
} from '#/api';
import {
  type ActionItem,
  TableAction,
  TableExport,
  VxeBasicTable,
} from '#/components';
import { DictLogProcess, DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { downloadExcel, formatToDateTime } from '#/utils';

import { TableDetail, TableQuery } from './components';

type LogColumns = VxeGridProps<LogApi.Error>['columns'];

const dictStore = useDictStore();
dictStore.initDictData(
  DictTypeEnum.USER_TYPE,
  DictTypeEnum.ERROR_LOG_PROCESS_STATUS,
);

let logQuery: LogApi.ErrorQuery = {};
const vxeBasicTableRef = ref<InstanceType<typeof VxeBasicTable>>();

const requestConfig = {
  loadingDelay: 200,
  manual: true,
};

const { loading: exportLoading, runAsync: exportLog } = useRequest(
  exporErrorLogApi,
  requestConfig,
);

const { runAsync: updateStatus } = useRequest(
  updateErrorLogStatusApi,
  requestConfig,
);

const { runAsync: batchUpdateStatus } = useRequest(
  batchUpdateErrorLogStatusApi,
  requestConfig,
);

const [TableExportModal, exportModal] = useVbenModal({
  connectedComponent: TableExport,
});

const [TableDetailModal, detailModal] = useVbenModal({
  connectedComponent: TableDetail,
});

const vxeTable = computed(() =>
  vxeBasicTableRef.value?.getTableInstance<LogApi.Error>(),
);

const columns = computed<LogColumns>(() => [
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
    title: $t('zen.service.log.common.code'),
  },
  {
    align: 'center',
    field: 'userId',
    minWidth: 80,
    title: $t('zen.service.log.common.userId'),
  },
  {
    align: 'center',
    field: 'userType',
    minWidth: 100,
    slots: { default: 'userType' },
    title: $t('zen.service.log.common.userType'),
  },
  {
    align: 'center',
    field: 'appName',
    minWidth: 150,
    title: $t('zen.service.log.common.appName'),
    visible: false,
  },
  {
    align: 'center',
    field: 'requestMethod',
    minWidth: 80,
    title: $t('zen.service.log.common.requestMethod'),
  },
  {
    field: 'requestUrl',
    headerAlign: 'center',
    minWidth: 250,
    title: $t('zen.service.log.common.requestUrl'),
  },
  {
    align: 'center',
    field: 'exTime',
    formatter: ({ cellValue }) => formatToDateTime(cellValue),
    minWidth: 150,
    title: $t('zen.service.log.error.exTime'),
  },
  {
    align: 'center',
    field: 'exName',
    minWidth: 300,
    title: $t('zen.service.log.error.exName'),
  },
  {
    align: 'center',
    field: 'processStatus',
    minWidth: 100,
    slots: { default: 'processStatus' },
    title: $t('zen.service.log.error.status'),
  },
  {
    align: 'center',
    fixed: 'right',
    slots: { default: 'opt' },
    title: $t('zen.common.opt'),
    width: 240,
  },
]);

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:error-log:update-status',
    icon: 'ep:close',
    onClick: () => handleBatchProcess(DictLogProcess.IGNORE),
    title: $t('zen.service.log.error.batchIgnore'),
    type: 'info',
  },
  {
    auth: 'system:error-log:update-status',
    icon: 'ep:check',
    onClick: () => handleBatchProcess(DictLogProcess.PROCESSED),
    title: $t('zen.service.log.error.batchProcess'),
    type: 'success',
  },
  {
    auth: 'system:error-log:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    onClick: () => exportModal.open(),
    title: $t('zen.common.export'),
    type: 'warning',
  },
]);

const tableOpts = reactive<VxeGridProps<LogApi.Error>>({
  checkboxConfig: {
    checkMethod: ({ row }) => row.processStatus === DictLogProcess.UN_PROCESS,
    highlight: true,
    range: true,
  },
  customConfig: {},
  id: 'log_error_manage',
  pagerConfig: {
    pageSize: 20,
  },
  printConfig: {},
  proxyConfig: {
    ajax: {
      query: ({ page: { currentPage, pageSize } }) =>
        getErrorLogPageListApi({
          pageNum: currentPage,
          pageSize,
          ...logQuery,
        }),
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

function createActions(row: LogApi.Error) {
  const disabled = row.processStatus !== DictLogProcess.UN_PROCESS;

  const actions: ActionItem[] = [
    {
      icon: 'ep:view',
      label: $t('zen.common.detail'),
      onClick: () => {
        detailModal.setData(row);
        detailModal.open();
      },
      type: 'primary',
    },
    {
      auth: 'system:error-log:update-status',
      disabled,
      icon: 'ep:circle-check',
      label: $t('zen.service.log.error.processed'),
      popConfirm: {
        on: {
          confirm: () => {
            updateStatus({
              id: row.id,
              processStatus: DictLogProcess.PROCESSED,
            }).then(requestAfter);
          },
        },
        title: $t('zen.service.log.error.processTip'),
      },
      type: 'success',
    },
    {
      auth: 'system:error-log:update-status',
      disabled,
      icon: 'ep:circle-close',
      label: $t('zen.service.log.error.ignored'),
      popConfirm: {
        on: {
          confirm: () => {
            updateStatus({
              id: row.id,
              processStatus: DictLogProcess.IGNORE,
            }).then(requestAfter);
          },
        },
        title: $t('zen.service.log.error.ignoreTip'),
      },
      type: 'info',
    },
  ];

  return actions;
}

function handleQuery(query: LogApi.ErrorQuery) {
  logQuery = query;
  vxeTable.value?.commitProxy('query');
}

function requestAfter(reload = true) {
  ElMessage.success($t('zen.common.successTip'));
  reload && reloadTable();
}

function reloadTable() {
  vxeTable.value?.commitProxy('reload');
}

async function handleExport(fileName: string) {
  if (exportLoading.value) {
    return;
  }
  const { data } = await exportLog(logQuery);
  downloadExcel(data, fileName);
  exportModal.close();
  ElMessage.success($t('zen.export.success'));
}

function handleBatchProcess(status: DictLogProcess) {
  const records = vxeTable.value?.getCheckboxRecords();
  if (!records || records.length === 0) {
    ElMessage.warning($t('zen.common.selectTip'));
    return;
  }

  const title = $t('zen.common.systemTitle');
  const message = $t('zen.common.updateConfirm');
  ElMessageBox.confirm(message, title, {
    closeOnClickModal: false,
    draggable: true,
    type: 'warning',
  }).then(() => {
    const ids = records.map((item) => item.id);
    batchUpdateStatus({ ids, processStatus: status }).then(requestAfter);
  });
}
</script>

<template>
  <VxeBasicTable ref="vxeBasicTableRef" :columns v-bind="tableOpts">
    <template #form>
      <TableQuery @query="handleQuery" />
    </template>

    <template #toolbar_left>
      <TableAction
        :actions="toolbarActions"
        :link="false"
        :show-empty="false"
        circle
      />

      <TableExportModal
        :default-name="$t('zen.service.log.error.title')"
        @confirm="handleExport"
      />
      <TableDetailModal />
    </template>

    <template #userType="{ row: { userType } }">
      <ElTag :type="dictStore.getUserType(userType)?.color">
        {{ dictStore.getUserType(userType)?.label }}
      </ElTag>
    </template>

    <template #processStatus="{ row: { processStatus } }">
      <ElTag :type="dictStore.getLogProcess(processStatus)?.color">
        {{ dictStore.getLogProcess(processStatus)?.label }}
      </ElTag>
    </template>

    <template #opt="{ row }">
      <TableAction :actions="createActions(row)" />
    </template>
  </VxeBasicTable>
</template>
