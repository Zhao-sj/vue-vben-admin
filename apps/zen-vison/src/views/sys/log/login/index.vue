<script setup lang="ts">
import type { VxeGridProps } from 'vxe-table';

import { useVbenModal } from '@vben/common-ui';

import { exporLoginLogApi, getLoginLogPageListApi, type LogApi } from '#/api';
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

import { TableQuery } from './components';

type LogColumns = VxeGridProps<LogApi.Login>['columns'];

const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.LOGIN_TYPE, DictTypeEnum.LOGIN_RESULT);

let logQuery: LogApi.LoginQuery = {};
const vxeBasicTableRef = ref<InstanceType<typeof VxeBasicTable>>();

const { loading: exportLoading, runAsync: exportLog } = useRequest(
  exporLoginLogApi,
  {
    loadingDelay: 200,
    manual: true,
  },
);

const [TableExportModal, exportModal] = useVbenModal({
  connectedComponent: TableExport,
});

const vxeTable = computed(() =>
  vxeBasicTableRef.value?.getTableInstance<LogApi.Login>(),
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
    field: 'type',
    minWidth: 150,
    slots: { default: 'type' },
    title: $t('zen.service.log.login.type'),
  },
  {
    align: 'center',
    field: 'username',
    minWidth: 150,
    title: $t('zen.service.log.login.username'),
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
  },
  {
    align: 'center',
    field: 'result',
    minWidth: 100,
    slots: { default: 'result' },
    title: $t('zen.service.log.login.result'),
  },
  {
    align: 'center',
    field: 'createTime',
    formatter: ({ cellValue }) => formatToDateTime(cellValue),
    minWidth: 150,
    title: $t('zen.service.log.login.createTime'),
  },
]);

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:login-log:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    onClick: () => exportModal.open(),
    title: $t('zen.common.export'),
    type: 'warning',
  },
]);

const tableOpts = reactive<VxeGridProps<LogApi.Login>>({
  customConfig: {},
  id: 'log_login_manage',
  pagerConfig: {
    pageSize: 20,
  },
  printConfig: {},
  proxyConfig: {
    ajax: {
      query: ({ page: { currentPage, pageSize } }) =>
        getLoginLogPageListApi({
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

function handleQuery(query: LogApi.LoginQuery) {
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
        :default-name="$t('zen.service.log.login.title')"
        @confirm="handleExport"
      />
    </template>

    <template #type="{ row: { type } }">
      <ElTag :type="dictStore.getLoginType(type)?.color">
        {{ dictStore.getLoginType(type)?.label }}
      </ElTag>
    </template>

    <template #ua="{ row: { ua } }">
      <DeviceInfo :ua />
    </template>

    <template #result="{ row: { result } }">
      <ElTag :type="dictStore.getLoginResult(result)?.color">
        {{ dictStore.getLoginResult(result)?.label }}
      </ElTag>
    </template>
  </VxeBasicTable>
</template>
