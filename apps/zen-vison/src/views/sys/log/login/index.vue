<script setup lang="ts">
import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  exporLoginLogApi,
  getLoginLogPageListApi,
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

import { TableQuery } from './components';

type LogColumns = VxeGridProps<LogApi.Login>['columns'];

const { hasAccessByCodes } = useAccess();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.LOGIN_TYPE, DictTypeEnum.LOGIN_RESULT);

const hasTenantPermission = hasAccessByCodes(['system:tenant:list']);
let logQuery: LogApi.LoginQuery = {};

const requestConfig = {
  loadingDelay: 200,
  manual: true,
};

const { data: tenantList } = useRequest(getTenantSimpleListApi, {
  manual: !hasTenantPermission,
});

const { loading: exportLoading, runAsync: exportLog } = useRequest(
  exporLoginLogApi,
  requestConfig,
);

const [TableExportModal, exportModal] = useVbenModal({
  connectedComponent: TableExport,
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
          title: $t('zen.service.log.login.tenant'),
        },
      ]
    : []),
  {
    field: 'type',
    minWidth: 150,
    slots: { default: 'type' },
    title: $t('zen.service.log.login.type'),
  },
  {
    field: 'username',
    minWidth: 150,
    title: $t('zen.service.log.login.username'),
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
  },
  {
    field: 'result',
    minWidth: 100,
    slots: { default: 'result' },
    title: $t('zen.service.log.login.result'),
  },
  {
    field: 'createTime',
    formatter: 'formatDateTime',
    minWidth: 150,
    title: $t('zen.service.log.login.createTime'),
  },
];

const gridOptions: VxeGridProps<LogApi.Login> = {
  columns,
  height: 'auto',
  customConfig: {},
  id: 'log_login_manage',
  proxyConfig: {
    ajax: {
      query: ({ page: { currentPage, pageSize } }) =>
        getLoginLogPageListApi({
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
    auth: 'system:login-log:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    onClick: () => exportModal.open(),
    title: $t('zen.common.export'),
    type: 'warning',
  },
]);

function handleQuery(query: LogApi.LoginQuery) {
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
          :default-name="$t('zen.service.log.login.title')"
          @confirm="handleExport"
        />
      </template>

      <template #tenant="{ row: { tenantId } }">
        {{ tenantList?.find((item) => item.id === tenantId)?.name }}
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
    </Grid>
  </Page>
</template>
