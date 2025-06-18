<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { OAuth2Api } from '#/api';
import type { ActionItem } from '#/components';

import { Page } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteAccessTokenApi, getOAuth2TokenPageApi } from '#/api';
import { TableAction } from '#/components';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

import { UserInfo } from './components';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.USER_TYPE, DictTypeEnum.SEX);

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    fieldName: 'clientId',
    label: $t('sys.oauth2.token.clientId'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.USER_TYPE),
    },
    fieldName: 'userType',
    label: $t('sys.oauth2.token.userType'),
  },
  {
    component: 'Input',
    fieldName: 'userId',
    label: $t('sys.oauth2.token.userId'),
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
  wrapperClass: 'grid-cols-1 lg:grid-cols-4 2xl:grid-cols-6',
}));

const columns: VxeTableGridOptions<OAuth2Api.AccessToken>['columns'] = [
  {
    field: 'id',
    minWidth: 80,
    title: $t('sys.oauth2.token.id'),
  },
  {
    field: 'clientId',
    minWidth: 150,
    title: $t('sys.oauth2.token.clientId'),
    visible: false,
  },
  {
    field: 'userId',
    minWidth: 80,
    title: $t('sys.oauth2.token.userId'),
    slots: { default: 'userId' },
  },
  {
    field: 'userType',
    minWidth: 80,
    title: $t('sys.oauth2.token.userType'),
    cellRender: {
      name: 'CellDict',
      props: {
        type: DictTypeEnum.USER_TYPE,
      },
    },
  },
  {
    field: 'accessToken',
    minWidth: 250,
    title: $t('sys.oauth2.token.accessToken'),
  },
  {
    field: 'refreshToken',
    minWidth: 250,
    title: $t('sys.oauth2.token.refreshToken'),
  },
  {
    field: 'createTime',
    minWidth: 150,
    title: $t('sys.oauth2.token.createTime'),
    formatter: 'formatDateTime',
  },
  {
    field: 'expiresTime',
    minWidth: 150,
    title: $t('sys.oauth2.token.expiresTime'),
    formatter: 'formatDateTime',
  },
  {
    field: 'opt',
    title: $t('page.options'),
    width: 120,
    fixed: isMobile.value ? null : 'right',
    slots: { default: 'opt' },
  },
];

const gridOptions: VxeTableGridOptions<OAuth2Api.AccessToken> = {
  columns,
  height: 'auto',
  id: 'oauth2_token_manage',
  proxyConfig: {
    ajax: {
      query: ({ page }, formValues) =>
        getOAuth2TokenPageApi({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        }),
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

function createActions(row: OAuth2Api.AccessToken) {
  const actions: ActionItem[] = [
    {
      auth: 'system:oauth2-token:delete',
      icon: 'lucide:log-out',
      btnText: $t('sys.oauth2.token.kickout'),
      popConfirm: {
        on: {
          confirm: () =>
            deleteAccessTokenApi(row.accessToken).then(requestAfter),
        },
        title: $t('sys.oauth2.token.kickoutTip', [row.userId]),
        width: 240,
      },
      type: 'primary',
    },
  ];

  return actions;
}

function requestAfter(reload = true) {
  ElMessage.success($t('page.success'));
  reload && reloadTable();
}

async function reloadTable() {
  const values = gridApi.formApi.getValues();
  gridApi.reload(values);
}
</script>

<template>
  <Page auto-content-height>
    <Grid
      :table-title="$t('sys.oauth2.token.list')"
      :form-options="formOptions"
    >
      <template #toolbar-actions>
        <div></div>
      </template>

      <template #userId="{ row }">
        <UserInfo :id="row.userId" />
      </template>

      <template #opt="{ row }">
        <TableAction :actions="createActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
