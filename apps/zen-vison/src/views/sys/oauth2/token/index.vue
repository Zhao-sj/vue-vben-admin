<script setup lang="ts">
import { Page } from '@vben/common-ui';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  deleteAccessTokenApi,
  getOAuth2TokenPageApi,
  type OAuth2Api,
} from '#/api';
import { type ActionItem, TableAction } from '#/components';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

import { TableQuery, UserInfo } from './components';

type TokenColumns = VxeGridProps<OAuth2Api.AccessToken>['columns'];

const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.USER_TYPE, DictTypeEnum.SEX);
let accessTokenQuery: OAuth2Api.TokenPageQuery = {};

const columns: TokenColumns = [
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
    slots: { default: 'userType' },
    title: $t('sys.oauth2.token.userType'),
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
    formatter: 'formatDateTime',
    minWidth: 150,
    title: $t('sys.oauth2.token.createTime'),
  },
  {
    field: 'expiresTime',
    formatter: 'formatDateTime',
    minWidth: 150,
    title: $t('sys.oauth2.token.expiresTime'),
  },
  {
    title: $t('page.options'),
    width: 120,
    slots: { default: 'opt' },
  },
];

const gridOptions: VxeGridProps<OAuth2Api.AccessToken> = {
  columns,
  height: 'auto',
  customConfig: {},
  id: 'oauth2_token_manage',
  proxyConfig: {
    ajax: {
      query: ({ page: { currentPage, pageSize } }) =>
        getOAuth2TokenPageApi({
          pageNum: currentPage,
          pageSize,
          ...accessTokenQuery,
        }),
    },
  },
  toolbarConfig: {
    refresh: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions: {}, gridOptions });

function createActions(row: OAuth2Api.AccessToken) {
  const actions: ActionItem[] = [
    {
      auth: 'system:oauth2-token:delete',
      icon: 'lucide:log-out',
      label: $t('sys.oauth2.token.kickout'),
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

function reloadTable() {
  gridApi.reload(accessTokenQuery);
}

function handleQuery(query: OAuth2Api.TokenPageQuery) {
  accessTokenQuery = query;
  gridApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #form>
        <TableQuery @query="handleQuery" />
      </template>

      <template #toolbar-actions>
        <div></div>
      </template>

      <template #userId="{ row }">
        <UserInfo :id="row.userId" />
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
