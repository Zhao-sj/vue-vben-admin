<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
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

const columns: VxeTableGridOptions<LogApi.Error>['columns'] = [
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
    width: 180,
    fixed: isMobile.value ? null : 'right',
    slots: { default: 'opt' },
  },
];

const gridOptions: VxeTableGridOptions<LogApi.Error> = {
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
    auth: 'portal:consult:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    btnText: $t('page.export.action'),
    onClick: () => exportModal.open(),
  },
  {
    auth: 'portal:consult:update-status',
    icon: 'ep:close',
    btnText: $t('portal.consult.ignored'),
    onClick: () => handleBatchProcess(DictConsultAccept.IGNORE),
    type: 'danger',
  },
  {
    auth: 'portal:consult:update-status',
    icon: 'ep:check',
    btnText: $t('portal.consult.processed'),
    onClick: () => handleBatchProcess(DictConsultAccept.ACCEPT),
    type: 'success',
  },
]);

function createActions(row: LogApi.Error) {
  const actions: ActionItem[] = [
    {
      auth: 'portal:consult:update-status',
      icon: 'ep:circle-check',
      btnText: $t('portal.consult.processed'),
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
      icon: 'ep:circle-close',
      btnText: $t('portal.consult.ignored'),
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

  return row.processStatus === DictConsultAccept.UN_ACCEPT ? actions : [];
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
    <Grid :table-title="$t('portal.consult.list')" :form-options="formOptions">
      <template #toolbar-tools>
        <TableAction
          :actions="toolbarActions"
          :link="false"
          :show-empty="false"
        />

        <TableExportModal
          :default-name="$t('portal.consult.list')"
          @confirm="handleExport"
        />
      </template>

      <template #opt="{ row }">
        <TableAction :actions="createActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
