<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';

import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
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

import { TableDetail } from './components';

const { isMobile } = useIsMobile();
const { hasAccessByCodes } = useAccess();
const dictStore = useDictStore();
dictStore.initDictData(
  DictTypeEnum.USER_TYPE,
  DictTypeEnum.ERROR_LOG_PROCESS_STATUS,
);

const hasTenantPermission = hasAccessByCodes(['system:tenant:list']);

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

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.log.appName')]),
    },
    fieldName: 'appName',
    label: $t('sys.log.appName'),
    dependencies: {
      triggerFields: ['appName'],
      if: () => false,
    },
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.USER_TYPE),
      placeholder: $t('page.pleaseSelect', [$t('sys.log.userType')]),
    },
    fieldName: 'userType',
    label: $t('sys.log.userType'),
  },
  {
    component: 'Select',
    componentProps: {
      options: tenantList.value?.map((item) => ({
        label: item.name,
        value: item.id,
      })),
      placeholder: $t('page.pleaseSelect', [$t('sys.log.error.tenant')]),
    },
    fieldName: 'tenantId',
    label: $t('sys.log.error.tenant'),
    dependencies: {
      if: () => tenantList.value?.length > 0,
      triggerFields: ['tenantId'],
    },
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.log.userId')]),
    },
    fieldName: 'userId',
    label: $t('sys.log.userId'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.log.requestUrl')]),
    },
    fieldName: 'requestUrl',
    label: $t('sys.log.requestUrl'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.ERROR_LOG_PROCESS_STATUS),
      placeholder: $t('page.pleaseSelect', [$t('sys.log.error.status')]),
    },
    fieldName: 'processStatus',
    label: $t('sys.log.error.status'),
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
    fieldName: 'exTime',
    label: $t('sys.log.error.exTime'),
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
  wrapperClass: 'grid-cols-1 lg:grid-cols-4 2xl:grid-cols-5',
}));

const columns: VxeGridProps<LogApi.Error>['columns'] = [
  {
    type: 'checkbox',
    width: 50,
    fixed: isMobile.value ? null : 'left',
  },
  {
    field: 'id',
    minWidth: 80,
    title: $t('sys.log.id'),
  },
  ...(hasTenantPermission
    ? [
        {
          field: 'tenantId',
          minWidth: 150,
          slots: { default: 'tenant' },
          title: $t('sys.log.error.tenant'),
        },
      ]
    : []),
  {
    field: 'userId',
    minWidth: 80,
    title: $t('sys.log.userId'),
  },
  {
    field: 'userType',
    minWidth: 100,
    title: $t('sys.log.userType'),
    cellRender: {
      name: 'CellDict',
      props: {
        type: DictTypeEnum.USER_TYPE,
      },
    },
  },
  {
    field: 'appName',
    minWidth: 150,
    title: $t('sys.log.appName'),
    visible: false,
  },
  {
    field: 'requestMethod',
    minWidth: 80,
    title: $t('sys.log.requestMethod'),
  },
  {
    field: 'requestUrl',
    align: 'left',
    headerAlign: 'center',
    minWidth: 250,
    title: $t('sys.log.requestUrl'),
  },
  {
    field: 'exTime',
    minWidth: 150,
    title: $t('sys.log.error.exTime'),
    formatter: 'formatDateTime',
  },
  {
    field: 'exName',
    minWidth: 300,
    title: $t('sys.log.error.exName'),
  },
  {
    field: 'processStatus',
    minWidth: 100,
    title: $t('sys.log.error.status'),
    cellRender: {
      name: 'CellDict',
      props: {
        type: DictTypeEnum.ERROR_LOG_PROCESS_STATUS,
      },
    },
  },
  {
    title: $t('page.options'),
    width: 240,
    fixed: isMobile.value ? null : 'right',
    slots: { default: 'opt' },
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
      query: ({ page }, formValues) =>
        getErrorLogPageListApi({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        }),
    },
  },
  toolbarConfig: {
    refresh: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:error-log:update-status',
    icon: 'ep:close',
    onClick: () => handleBatchProcess(DictLogProcess.IGNORE),
    title: $t('sys.log.error.batchIgnore'),
    type: 'danger',
  },
  {
    auth: 'system:error-log:update-status',
    icon: 'ep:check',
    onClick: () => handleBatchProcess(DictLogProcess.PROCESSED),
    title: $t('sys.log.error.batchProcess'),
    type: 'success',
  },
  {
    auth: 'system:error-log:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    onClick: () => exportModal.open(),
    title: $t('page.export.title'),
    type: 'warning',
  },
]);

function createActions(row: LogApi.Error) {
  const disabled = row.processStatus !== DictLogProcess.UN_PROCESS;

  const actions: ActionItem[] = [
    {
      icon: 'ep:view',
      label: $t('page.detail'),
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
      label: $t('sys.log.error.processed'),
      popConfirm: {
        on: {
          confirm: () => {
            updateStatus({
              id: row.id,
              processStatus: DictLogProcess.PROCESSED,
            }).then(requestAfter);
          },
        },
        title: $t('sys.log.error.processTip'),
      },
      type: 'success',
    },
    {
      auth: 'system:error-log:update-status',
      disabled,
      icon: 'ep:circle-close',
      label: $t('sys.log.error.ignored'),
      popConfirm: {
        on: {
          confirm: () => {
            updateStatus({
              id: row.id,
              processStatus: DictLogProcess.IGNORE,
            }).then(requestAfter);
          },
        },
        title: $t('sys.log.error.ignoreTip'),
      },
      type: 'danger',
    },
  ];

  return actions;
}

function requestAfter(reload = true) {
  ElMessage.success($t('page.success'));
  reload && reloadTable();
}

async function reloadTable() {
  const values = await gridApi.formApi.getValues();
  gridApi.reload(values);
}

async function handleExport(fileName: string) {
  if (exportLoading.value) {
    return;
  }
  const values = await gridApi.formApi.getValues();
  const { data } = await exportLog(values);
  downloadExcel(data, fileName);
  exportModal.close();
  ElMessage.success($t('page.export.success'));
}

async function handleBatchProcess(status: DictLogProcess) {
  const values = await gridApi.formApi.getValues();
  useBatchSelect<LogApi.Error>({
    gridApi,
    handleBatch: (records) =>
      batchUpdateStatus({
        ids: records.map((item) => item.id),
        processStatus: status,
      }),
    query: values,
    type: $t('page.update'),
  });
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

        <TableExportModal
          :default-name="$t('sys.log.error.title')"
          @confirm="handleExport"
        />
        <TableDetailModal />
      </template>

      <template #tenant="{ row: { tenantId } }">
        {{ tenantList?.find((item) => item.id === tenantId)?.name }}
      </template>

      <template #opt="{ row }">
        <TableAction :actions="createActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
