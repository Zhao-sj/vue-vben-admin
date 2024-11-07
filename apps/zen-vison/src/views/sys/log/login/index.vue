<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';

import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

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

const { isMobile } = useIsMobile();
const { hasAccessByCodes } = useAccess();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.LOGIN_TYPE, DictTypeEnum.LOGIN_RESULT);

const hasTenantPermission = hasAccessByCodes(['system:tenant:list']);

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

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Select',
    componentProps: {
      options: [
        { label: $t('sys.log.login.success'), value: true },
        { label: $t('sys.log.login.fail'), value: false },
      ],
      placeholder: $t('page.pleaseSelect', [$t('sys.log.login.result')]),
    },
    fieldName: 'status',
    label: $t('sys.log.login.result'),
  },
  {
    component: 'Select',
    componentProps: {
      options: tenantList.value?.map((item) => ({
        label: item.name,
        value: item.id,
      })),
      placeholder: $t('page.pleaseSelect', [$t('sys.log.login.tenant')]),
    },
    fieldName: 'tenantId',
    label: $t('sys.log.login.tenant'),
    dependencies: {
      if: () => tenantList.value?.length > 0,
      triggerFields: ['tenantId'],
    },
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.log.ip')]),
    },
    fieldName: 'ip',
    label: $t('sys.log.ip'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.log.login.username')]),
    },
    fieldName: 'username',
    label: $t('sys.log.login.username'),
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
    label: $t('sys.log.login.createTime'),
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
  wrapperClass: 'grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4',
}));

const columns: VxeGridProps<LogApi.Login>['columns'] = [
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
          title: $t('sys.log.login.tenant'),
        },
      ]
    : []),
  {
    field: 'type',
    minWidth: 150,
    title: $t('sys.log.login.type'),
    cellRender: {
      name: 'CellDict',
      props: {
        type: DictTypeEnum.LOGIN_TYPE,
      },
    },
  },
  {
    field: 'username',
    minWidth: 150,
    title: $t('sys.log.login.username'),
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
  },
  {
    field: 'result',
    minWidth: 100,
    title: $t('sys.log.login.result'),
    cellRender: {
      name: 'CellDict',
      props: {
        type: DictTypeEnum.LOGIN_RESULT,
      },
    },
  },
  {
    field: 'createTime',
    formatter: 'formatDateTime',
    minWidth: 150,
    title: $t('sys.log.login.createTime'),
  },
];

const gridOptions: VxeGridProps<LogApi.Login> = {
  columns,
  height: 'auto',
  customConfig: {},
  id: 'log_login_manage',
  proxyConfig: {
    ajax: {
      query: ({ page }, formValues) =>
        getLoginLogPageListApi({
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
    auth: 'system:login-log:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    onClick: () => exportModal.open(),
    title: $t('page.export.title'),
    type: 'warning',
  },
]);

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
          :default-name="$t('sys.log.login.title')"
          @confirm="handleExport"
        />
      </template>

      <template #tenant="{ row: { tenantId } }">
        {{ tenantList?.find((item) => item.id === tenantId)?.name }}
      </template>

      <template #ua="{ row: { ua } }">
        <DeviceInfo :ua />
      </template>
    </Grid>
  </Page>
</template>
