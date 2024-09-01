<script setup lang="ts">
import type { VxeGridProps } from 'vxe-table';

import { useVbenModal } from '@vben/common-ui';

import { isNumber } from 'lodash-es';

import { exporAccessLogApi, getAccessLogPageListApi, type LogApi } from '#/api';
import {
  type ActionItem,
  TableAction,
  TableExport,
  VxeBasicTable,
} from '#/components';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { downloadExcel, formatToDateTime } from '#/utils';
import { DeviceInfo } from '#/views/sys/log/components';

import { TableDetail, TableQuery } from './components';

type LogColumns = VxeGridProps<LogApi.Access>['columns'];

const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.USER_TYPE, DictTypeEnum.OPERATE_TYPE);

let logQuery: LogApi.AccessQuery = {};
const vxeBasicTableRef = ref<InstanceType<typeof VxeBasicTable>>();

const { loading: exportLoading, runAsync: exportLog } = useRequest(
  exporAccessLogApi,
  {
    loadingDelay: 200,
    manual: true,
  },
);

const [TableExportModal, exportModal] = useVbenModal({
  connectedComponent: TableExport,
});

const [TableDetailModal, detailModal] = useVbenModal({
  connectedComponent: TableDetail,
});

const vxeTable = computed(() =>
  vxeBasicTableRef.value?.getTableInstance<LogApi.Access>(),
);

const columns = computed<LogColumns>(() => [
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
    minWidth: 80,
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
    field: 'beginTime',
    formatter: ({ cellValue }) => formatToDateTime(cellValue),
    minWidth: 150,
    title: $t('zen.service.log.access.createTime'),
  },
  {
    align: 'center',
    field: 'duration',
    formatter: ({ cellValue }) =>
      isNumber(cellValue) ? `${cellValue}ms` : cellValue,
    minWidth: 80,
    title: $t('zen.service.log.access.duration'),
  },
  {
    align: 'center',
    field: 'resultCode',
    minWidth: 100,
    title: $t('zen.service.log.access.resultCode'),
    visible: false,
  },
  {
    align: 'center',
    field: 'resultMsg',
    formatter: ({ cellValue }) => cellValue || '-',
    minWidth: 150,
    title: $t('zen.service.log.access.resultMsg'),
  },
  {
    align: 'center',
    field: 'ip',
    minWidth: 150,
    title: $t('zen.service.log.common.ip'),
  },
  {
    align: 'center',
    field: 'location',
    minWidth: 150,
    title: $t('zen.service.log.common.location'),
  },
  {
    align: 'center',
    field: 'ua',
    minWidth: 300,
    slots: { default: 'ua' },
    title: $t('zen.service.log.common.ua'),
    visible: false,
  },
  {
    align: 'center',
    fixed: 'right',
    slots: { default: 'opt' },
    title: $t('zen.common.opt'),
    width: 120,
  },
]);

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:access-log:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    onClick: () => exportModal.open(),
    title: $t('zen.common.export'),
    type: 'warning',
  },
]);

const tableOpts = reactive<VxeGridProps<LogApi.Access>>({
  customConfig: {},
  id: 'log_access_manage',
  pagerConfig: {
    pageSize: 20,
  },
  printConfig: {},
  proxyConfig: {
    ajax: {
      query: ({ page: { currentPage, pageSize } }) =>
        getAccessLogPageListApi({
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
  vxeTable.value?.commitProxy('query');
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
        :default-name="$t('zen.service.log.access.title')"
        @confirm="handleExport"
      />
      <TableDetailModal />
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
  </VxeBasicTable>
</template>
