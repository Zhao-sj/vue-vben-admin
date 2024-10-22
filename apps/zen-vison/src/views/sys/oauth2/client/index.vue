<script setup lang="ts">
import { Page, useVbenModal } from '@vben/common-ui';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  batchDeleteOAuth2ClientApi,
  deleteOAuth2ClientApi,
  getOAuth2ClientPageApi,
  type OAuth2Api,
} from '#/api';
import { type ActionItem, TableAction } from '#/components';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { useBatchSelect } from '#/utils';

import { TableAdd, TableEdit, TableQuery } from './components';

type ClientColumns = VxeGridProps<OAuth2Api.Client>['columns'];

const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS);
let clientQuery: OAuth2Api.ClientPageQuery = {};

const [TableAddModal, addModal] = useVbenModal({
  connectedComponent: TableAdd,
});

const [TableEditModal, editModal] = useVbenModal({
  connectedComponent: TableEdit,
});

const columns: ClientColumns = [
  {
    fixed: 'left',
    type: 'checkbox',
    width: 50,
  },
  {
    field: 'id',
    minWidth: 80,
    title: $t('zen.service.oauth2.client.id'),
    visible: false,
  },
  {
    field: 'logo',
    minWidth: 100,
    title: $t('zen.service.oauth2.client.logo'),
    cellRender: {
      name: 'CellAvatar',
      props: { shape: 'square' },
      attrs: { class: '!rounded-none !bg-transparent' },
    },
    showOverflow: false,
  },
  {
    field: 'name',
    minWidth: 150,
    title: $t('zen.service.oauth2.client.name'),
  },
  {
    field: 'clientId',
    minWidth: 150,
    title: $t('zen.service.oauth2.client.clientId'),
  },
  {
    field: 'secret',
    minWidth: 150,
    title: $t('zen.service.oauth2.client.secret'),
  },
  {
    field: 'accessTokenValiditySeconds',
    formatter: 'formatSeconds',
    minWidth: 150,
    title: $t('zen.service.oauth2.client.accessTokenValiditySeconds'),
  },
  {
    field: 'refreshTokenValiditySeconds',
    formatter: 'formatSeconds',
    minWidth: 150,
    title: $t('zen.service.oauth2.client.refreshTokenValiditySeconds'),
  },
  {
    field: 'status',
    minWidth: 100,
    slots: { default: 'status' },
    title: $t('zen.service.oauth2.client.status'),
  },
  {
    field: 'authorizedGrantTypes',
    minWidth: 240,
    title: $t('zen.service.oauth2.client.authorizedGrantTypes'),
    cellRender: { name: 'CellTags' },
    showOverflow: false,
  },
  {
    field: 'scopes',
    minWidth: 240,
    title: $t('zen.service.oauth2.client.scopes'),
    cellRender: { name: 'CellTags' },
    showOverflow: false,
    visible: false,
  },
  {
    field: 'autoApproveScopes',
    minWidth: 240,
    title: $t('zen.service.oauth2.client.autoApproveScopes'),
    cellRender: { name: 'CellTags' },
    showOverflow: false,
    visible: false,
  },
  {
    field: 'redirectUris',
    minWidth: 240,
    title: $t('zen.service.oauth2.client.redirectUris'),
    slots: { default: 'redirectUris' },
    showOverflow: false,
    visible: false,
  },
  {
    field: 'authorities',
    minWidth: 240,
    title: $t('zen.service.oauth2.client.authorities'),
    cellRender: { name: 'CellTags' },
    showOverflow: false,
    visible: false,
  },
  {
    field: 'resourceIds',
    minWidth: 240,
    title: $t('zen.service.oauth2.client.resourceIds'),
    cellRender: { name: 'CellTags' },
    showOverflow: false,
    visible: false,
  },
  {
    field: 'description',
    minWidth: 200,
    formatter: 'formatBlank',
    title: $t('zen.service.oauth2.client.description'),
    visible: false,
  },
  {
    field: 'createTime',
    formatter: 'formatDateTime',
    minWidth: 150,
    title: $t('zen.common.createTime'),
  },
  {
    title: $t('zen.common.opt'),
    width: 120,
    slots: { default: 'opt' },
    fixed: 'right',
  },
];

const gridOptions: VxeGridProps<OAuth2Api.Client> = {
  columns,
  height: 'auto',
  customConfig: {},
  id: 'oauth2_client_manage',
  proxyConfig: {
    ajax: {
      query: ({ page: { currentPage, pageSize } }) =>
        getOAuth2ClientPageApi({
          pageNum: currentPage,
          pageSize,
          ...clientQuery,
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
    auth: 'system:oauth2-client:delete',
    icon: 'ep:delete',
    onClick: () => {
      useBatchSelect<OAuth2Api.Client>({
        gridApi,
        handleBatch: (records) =>
          batchDeleteOAuth2ClientApi(records.map((item) => item.id)),
        query: clientQuery,
      });
    },
    title: $t('zen.common.batchDelete'),
    type: 'danger',
  },
  {
    auth: 'system:oauth2-client:create',
    icon: 'ep:plus',
    onClick: () => addModal.open(),
    title: $t('zen.common.create'),
    type: 'primary',
  },
]);

function createActions(row: OAuth2Api.Client) {
  const actions: ActionItem[] = [
    {
      auth: 'system:oauth2-client:update',
      icon: 'ep:edit',
      onClick: () => {
        editModal.setData({ id: row.id });
        editModal.open();
      },
      tooltip: {
        content: $t('zen.common.edit'),
      },
      type: 'primary',
    },
    {
      auth: 'system:oauth2-client:delete',
      icon: 'ep:delete',
      popConfirm: {
        on: {
          confirm: () => deleteOAuth2ClientApi(row.id).then(requestAfter),
        },
        title: $t('zen.common.confirmDelete'),
      },
      tooltip: {
        content: $t('zen.common.delete'),
      },
      type: 'danger',
    },
  ];

  return actions;
}

function requestAfter(reload = true) {
  ElMessage.success($t('zen.common.successTip'));
  reload && reloadTable();
}

function reloadTable() {
  gridApi.reload(clientQuery);
}

function handleQuery(query: OAuth2Api.ClientPageQuery) {
  clientQuery = query;
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
        <TableAction
          :actions="toolbarActions"
          :link="false"
          :show-empty="false"
          circle
        />

        <TableAddModal @success="reloadTable" />
        <TableEditModal @success="reloadTable" />
      </template>

      <template #status="{ row: { status } }">
        <ElTag :type="dictStore.getStatus(status)?.color">
          {{ dictStore.getStatus(status)?.label }}
        </ElTag>
      </template>

      <template #redirectUris="{ row: { redirectUris } }">
        <div
          v-if="redirectUris.length > 0"
          class="flex flex-wrap justify-center gap-1"
        >
          <ElLink
            v-for="uri in redirectUris"
            :key="uri"
            :href="uri"
            target="_blank"
            type="primary"
          >
            {{ uri }}
          </ElLink>
        </div>
        <div v-else>-</div>
      </template>

      <template #opt="{ row }">
        <TableAction :actions="createActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
