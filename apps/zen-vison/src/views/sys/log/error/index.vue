<script setup lang="ts">
import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter';
import {
  batchUpdateErrorLogStatusApi,
  exporErrorLogApi,
  getErrorLogPageListApi,
  getTenantSimpleListApi,
  type LogApi,
  updateErrorLogStatusApi,
} from '#/api';
import { type ActionItem, TableAction, TableExport } from '#/components';
import { DictLogProcess, DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { downloadExcel, useBatchSelect } from '#/utils';

import { TableDetail, TableQuery } from './components';

type LogColumns = VxeGridProps<LogApi.Error>['columns'];

const { hasAccessByCodes } = useAccess();
const dictStore = useDictStore();
dictStore.initDictData(
  DictTypeEnum.USER_TYPE,
  DictTypeEnum.ERROR_LOG_PROCESS_STATUS,
);

const hasTenantPermission = hasAccessByCodes(['system:tenant:list']);
let logQuery: LogApi.ErrorQuery = {};

const requestConfig = {
  loadingDelay: 200,
  manual: true,
};

const { data: tenantList } = useRequest(getTenantSimpleListApi, {
  manual: !hasTenantPermission,
});

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

const columns: LogColumns = [
  {
    type: 'checkbox',
    width: 50,
  },
  {
    field: 'id',
    minWidth: 80,
    title: $t('zen.service.log.common.code'),
  },
  ...(hasTenantPermission
    ? [
        {
          field: 'tenantId',
          minWidth: 150,
          slots: { default: 'tenant' },
          title: $t('zen.service.log.error.tenant'),
        },
      ]
    : []),
  {
    field: 'userId',
    minWidth: 80,
    title: $t('zen.service.log.common.userId'),
  },
  {
    field: 'userType',
    minWidth: 100,
    slots: { default: 'userType' },
    title: $t('zen.service.log.common.userType'),
  },
  {
    field: 'appName',
    minWidth: 150,
    title: $t('zen.service.log.common.appName'),
    visible: false,
  },
  {
    field: 'requestMethod',
    minWidth: 80,
    title: $t('zen.service.log.common.requestMethod'),
  },
  {
    field: 'requestUrl',
    align: 'left',
    headerAlign: 'center',
    minWidth: 250,
    title: $t('zen.service.log.common.requestUrl'),
  },
  {
    field: 'exTime',
    formatter: 'formatDateTime',
    minWidth: 150,
    title: $t('zen.service.log.error.exTime'),
  },
  {
    field: 'exName',
    minWidth: 300,
    title: $t('zen.service.log.error.exName'),
  },
  {
    field: 'processStatus',
    minWidth: 100,
    slots: { default: 'processStatus' },
    title: $t('zen.service.log.error.status'),
  },
  {
    slots: { default: 'opt' },
    title: $t('zen.common.opt'),
    width: 240,
  },
];

const gridOptions: VxeGridProps<LogApi.Error> = {
  columns,
  height: 'auto',
  checkboxConfig: {
    checkMethod: ({ row }) => row.processStatus === DictLogProcess.UN_PROCESS,
    highlight: true,
    range: true,
  },
  customConfig: {},
  id: 'log_error_manage',
  proxyConfig: {
    ajax: {
      query: ({ page: { currentPage, pageSize } }) =>
        getErrorLogPageListApi({
          pageNum: currentPage,
          pageSize,
          ...logQuery,
        }),
    },
  },
  toolbarConfig: {
    refresh: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions: {}, gridOptions });

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
  gridApi.query();
}

function requestAfter(reload = true) {
  ElMessage.success($t('zen.common.successTip'));
  reload && reloadTable();
}

function reloadTable() {
  gridApi.reload(logQuery);
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
  useBatchSelect<LogApi.Error>({
    gridApi,
    handleBatch: (records) =>
      batchUpdateStatus({
        ids: records.map((item) => item.id),
        processStatus: status,
      }),
    query: logQuery,
    type: $t('zen.common.update'),
  });
}
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #form>
        <TableQuery
          :show-tenant="tenantList?.length > 0"
          :tenant-list
          @query="handleQuery"
        />
      </template>

      <template #toolbar-actions>
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

      <template #tenant="{ row: { tenantId } }">
        {{ tenantList?.find((item) => item.id === tenantId)?.name }}
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
    </Grid>
  </Page>
</template>
