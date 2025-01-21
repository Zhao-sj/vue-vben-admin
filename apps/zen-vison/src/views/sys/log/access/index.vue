<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { LogApi } from '#/api';
import type { ActionItem } from '#/components';

import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { isNumber } from 'lodash-es';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  exporAccessLogApi,
  getAccessLogPageListApi,
  getTenantSimpleListApi,
} from '#/api';
import { TableAction, TableExport } from '#/components';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { downloadExcel } from '#/utils';
import { DeviceInfo } from '#/views/sys/log/components';

import { TableDetail } from './components';

const { isMobile } = useIsMobile();
const { hasAccessByCodes } = useAccess();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.USER_TYPE, DictTypeEnum.OPERATE_TYPE);

const hasTenantPermission = hasAccessByCodes(['system:tenant:list']);

const requestConfig = {
  loadingDelay: 200,
  manual: true,
};

const { data: tenantList } = useRequest(getTenantSimpleListApi, {
  manual: !hasTenantPermission,
});

const { loading: exportLoading, runAsync: exportLog } = useRequest(
  exporAccessLogApi,
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
    },
    fieldName: 'userType',
    label: $t('sys.log.userType'),
  },
  {
    component: 'Select',
    componentProps: {
      options:
        tenantList.value?.map((item) => ({
          label: item.name,
          value: item.id,
        })) || [],
    },
    fieldName: 'tenantId',
    label: $t('sys.log.access.tenant'),
    dependencies: {
      if: () => tenantList.value?.length > 0,
      triggerFields: ['tenantId'],
    },
  },
  {
    component: 'Input',
    fieldName: 'userId',
    label: $t('sys.log.userId'),
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: '!w-full',
      controlsPosition: 'right',
      min: 1,
    },
    fieldName: 'duration',
    label: $t('sys.log.access.duration'),
  },
  {
    component: 'Input',
    fieldName: 'requestUrl',
    label: $t('sys.log.requestUrl'),
  },
  {
    component: 'Input',
    fieldName: 'resultCode',
    label: $t('sys.log.access.resultCode'),
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
    fieldName: 'beginTime',
    label: $t('sys.log.access.createTime'),
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

const columns: VxeGridProps<LogApi.Access>['columns'] = [
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
          title: $t('sys.log.access.tenant'),
          visible: false,
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
    minWidth: 80,
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
    headerAlign: 'center',
    align: 'left',
    minWidth: 250,
    title: $t('sys.log.requestUrl'),
    showOverflow: true,
  },
  {
    field: 'beginTime',
    formatter: 'formatDateTime',
    minWidth: 150,
    title: $t('sys.log.access.createTime'),
  },
  {
    field: 'duration',
    minWidth: 80,
    title: $t('sys.log.access.duration'),
    formatter: ({ cellValue }) =>
      isNumber(cellValue) ? `${cellValue}ms` : cellValue,
  },
  {
    field: 'resultCode',
    minWidth: 100,
    title: $t('sys.log.access.resultCode'),
    visible: false,
  },
  {
    field: 'resultMsg',
    minWidth: 150,
    title: $t('sys.log.access.resultMsg'),
    formatter: 'formatBlank',
    showOverflow: true,
  },
  {
    field: 'ip',
    minWidth: 150,
    title: $t('sys.log.ip'),
  },
  {
    field: 'location',
    minWidth: 150,
    title: $t('sys.log.location'),
  },
  {
    field: 'ua',
    minWidth: 300,
    title: $t('sys.log.ua'),
    slots: { default: 'ua' },
    visible: false,
  },
  {
    title: $t('page.options'),
    width: 120,
    fixed: isMobile.value ? null : 'right',
    slots: { default: 'opt' },
  },
];

const gridOptions: VxeGridProps<LogApi.Access> = {
  columns,
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
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:access-log:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    onClick: () => exportModal.open(),
    title: $t('page.export.title'),
    type: 'warning',
  },
]);

function createActions(row: LogApi.Access) {
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
  ];

  return actions;
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
          :default-name="$t('sys.log.access.title')"
          @confirm="handleExport"
        />
        <TableDetailModal />
      </template>

      <template #tenant="{ row: { tenantId } }">
        {{ tenantList?.find((item) => item.id === tenantId)?.name }}
      </template>

      <template #ua="{ row: { ua } }">
        <DeviceInfo :ua />
      </template>

      <template #opt="{ row }">
        <TableAction :actions="createActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
