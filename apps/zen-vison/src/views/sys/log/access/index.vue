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
    title: $t('zen.service.log.common.code'),
  },
  ...(hasTenantPermission
    ? [
        {
          field: 'tenantId',
          minWidth: 150,
          slots: { default: 'tenant' },
          title: $t('zen.service.log.access.tenant'),
          visible: false,
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
    minWidth: 80,
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
    headerAlign: 'center',
    align: 'left',
    minWidth: 250,
    title: $t('zen.service.log.common.requestUrl'),
  },
  {
    field: 'beginTime',
    formatter: 'formatDateTime',
    minWidth: 150,
    title: $t('zen.service.log.access.createTime'),
  },
  {
    field: 'duration',
    formatter: ({ cellValue }) =>
      isNumber(cellValue) ? `${cellValue}ms` : cellValue,
    minWidth: 80,
    title: $t('zen.service.log.access.duration'),
  },
  {
    field: 'resultCode',
    minWidth: 100,
    title: $t('zen.service.log.access.resultCode'),
    visible: false,
  },
  {
    field: 'resultMsg',
    formatter: ({ cellValue }) => cellValue || '-',
    minWidth: 150,
    title: $t('zen.service.log.access.resultMsg'),
  },
  {
    field: 'ip',
    minWidth: 150,
    title: $t('zen.service.log.common.ip'),
  },
  {
    field: 'location',
    minWidth: 150,
    title: $t('zen.service.log.common.location'),
  },
  {
    field: 'ua',
    minWidth: 300,
    slots: { default: 'ua' },
    title: $t('zen.service.log.common.ua'),
    visible: false,
  },
  {
    fixed: 'right',
    slots: { default: 'opt' },
    title: $t('zen.common.opt'),
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
    title: $t('zen.common.export'),
    type: 'warning',
  },
]);

function createActions(row: LogApi.Access) {
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
  ElMessage.success($t('zen.export.success'));
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
          :default-name="$t('zen.service.log.access.title')"
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
