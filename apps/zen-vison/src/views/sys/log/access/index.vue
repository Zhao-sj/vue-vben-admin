<script setup lang="ts">
import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';

import { isNumber } from 'lodash-es';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  exporAccessLogApi,
  getAccessLogPageListApi,
  getTenantSimpleListApi,
  type LogApi,
} from '#/api';
import { type ActionItem, TableAction, TableExport } from '#/components';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { downloadExcel } from '#/utils';
import { DeviceInfo } from '#/views/sys/log/components';

import { TableDetail, TableQuery } from './components';

type LogColumns = VxeGridProps<LogApi.Access>['columns'];

const { hasAccessByCodes } = useAccess();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.USER_TYPE, DictTypeEnum.OPERATE_TYPE);

const hasTenantPermission = hasAccessByCodes(['system:tenant:list']);
let logQuery: LogApi.AccessQuery = {};

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

const columns: LogColumns = [
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
    slots: { default: 'userType' },
    title: $t('sys.log.userType'),
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
  },
  {
    field: 'beginTime',
    formatter: 'formatDateTime',
    minWidth: 150,
    title: $t('sys.log.access.createTime'),
  },
  {
    field: 'duration',
    formatter: ({ cellValue }) =>
      isNumber(cellValue) ? `${cellValue}ms` : cellValue,
    minWidth: 80,
    title: $t('sys.log.access.duration'),
  },
  {
    field: 'resultCode',
    minWidth: 100,
    title: $t('sys.log.access.resultCode'),
    visible: false,
  },
  {
    field: 'resultMsg',
    formatter: 'formatBlank',
    minWidth: 150,
    title: $t('sys.log.access.resultMsg'),
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
    slots: { default: 'ua' },
    title: $t('sys.log.ua'),
    visible: false,
  },
  {
    fixed: 'right',
    slots: { default: 'opt' },
    title: $t('page.options'),
    width: 120,
  },
];

const gridOptions: VxeGridProps<LogApi.Access> = {
  columns,
  height: 'auto',
  customConfig: {},
  id: 'log_access_manage',
  proxyConfig: {
    ajax: {
      query: ({ page: { currentPage, pageSize } }) =>
        getAccessLogPageListApi({
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

function handleQuery(query: LogApi.AccessQuery) {
  logQuery = query;
  gridApi.query();
}

async function handleExport(fileName: string) {
  if (exportLoading.value) {
    return;
  }
  const { data } = await exportLog(logQuery);
  downloadExcel(data, fileName);
  exportModal.close();
  ElMessage.success($t('page.export.success'));
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

      <template #userType="{ row: { userType } }">
        <ElTag :type="dictStore.getUserType(userType)?.color">
          {{ dictStore.getUserType(userType)?.label }}
        </ElTag>
      </template>

      <template #opt="{ row }">
        <TableAction :actions="createActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
