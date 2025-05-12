<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { LogApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchUpdateZeroadConsultApi,
  exporZeroadConsultApi,
  getZeroadConsultPageApi,
  updateZeroadConsultStatusApi,
} from '#/api';
import { TableAction, TableExport } from '#/components';
import { DictConsultAccept, DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { downloadExcel, useBatchSelect } from '#/utils';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.PORTAL_CONSULT_PROCESS_STATUS);

const requestConfig = {
  loadingDelay: 200,
  manual: true,
};

const { loading: exportLoading, runAsync: exportLog } = useRequest(
  exporZeroadConsultApi,
  requestConfig,
);

const { runAsync: updateStatus } = useRequest(
  updateZeroadConsultStatusApi,
  requestConfig,
);

const { runAsync: batchUpdateStatus } = useRequest(
  batchUpdateZeroadConsultApi,
  requestConfig,
);

const [TableExportModal, exportModal] = useVbenModal({
  connectedComponent: TableExport,
});

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    fieldName: 'company',
    label: $t('portal.consult.company'),
  },
  {
    component: 'Input',
    fieldName: 'mobile',
    label: $t('portal.consult.mobile'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(
        DictTypeEnum.PORTAL_CONSULT_PROCESS_STATUS,
      ),
    },
    fieldName: 'processStatus',
    label: $t('portal.consult.status'),
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
    label: $t('portal.consult.createTime'),
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
  wrapperClass: 'grid-cols-1 lg:grid-cols-3 2xl:grid-cols-5',
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
    title: $t('portal.consult.id'),
  },
  {
    field: 'company',
    minWidth: 150,
    title: $t('portal.consult.company'),
    showOverflow: true,
  },
  {
    field: 'name',
    minWidth: 80,
    title: $t('portal.consult.name'),
  },
  {
    field: 'mobile',
    minWidth: 150,
    title: $t('portal.consult.mobile'),
  },
  {
    field: 'email',
    minWidth: 150,
    title: $t('portal.consult.email'),
  },
  {
    field: 'content',
    minWidth: 250,
    title: $t('portal.consult.content'),
    showOverflow: true,
  },
  {
    field: 'createTime',
    minWidth: 150,
    title: $t('portal.consult.createTime'),
    formatter: 'formatDateTime',
  },
  {
    field: 'processStatus',
    minWidth: 100,
    title: $t('portal.consult.status'),
    cellRender: {
      name: 'CellDict',
      props: {
        type: DictTypeEnum.PORTAL_CONSULT_PROCESS_STATUS,
      },
    },
  },
  {
    field: 'opt',
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
    checkMethod: ({ row }) => row.processStatus === DictConsultAccept.UN_ACCEPT,
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
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'portal:consult:update-status',
    icon: 'ep:close',
    onClick: () => handleBatchProcess(DictConsultAccept.IGNORE),
    title: $t('portal.consult.batchIgnore'),
    type: 'danger',
  },
  {
    auth: 'portal:consult:update-status',
    icon: 'ep:check',
    onClick: () => handleBatchProcess(DictConsultAccept.ACCEPT),
    title: $t('portal.consult.batchProcess'),
    type: 'success',
  },
  {
    auth: 'portal:consult:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    onClick: () => exportModal.open(),
    title: $t('page.export.title'),
    type: 'warning',
  },
]);

function createActions(row: LogApi.Error) {
  const disabled = row.processStatus !== DictConsultAccept.UN_ACCEPT;

  const actions: ActionItem[] = [
    {
      auth: 'portal:consult:update-status',
      disabled,
      icon: 'ep:circle-check',
      label: $t('portal.consult.processed'),
      popConfirm: {
        on: {
          confirm: () => {
            updateStatus({
              id: row.id,
              processStatus: DictConsultAccept.ACCEPT,
            }).then(requestAfter);
          },
        },
        title: $t('portal.consult.processTip'),
      },
      type: 'success',
    },
    {
      auth: 'portal:consult:update-status',
      disabled,
      icon: 'ep:circle-close',
      label: $t('portal.consult.ignored'),
      popConfirm: {
        on: {
          confirm: () => {
            updateStatus({
              id: row.id,
              processStatus: DictConsultAccept.IGNORE,
            }).then(requestAfter);
          },
        },
        title: $t('portal.consult.ignoreTip'),
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

async function handleBatchProcess(status: DictConsultAccept) {
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
          :default-name="$t('portal.consult.title')"
          @confirm="handleExport"
        />
      </template>

      <template #opt="{ row }">
        <TableAction :actions="createActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
