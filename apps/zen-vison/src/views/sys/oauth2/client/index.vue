<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { OAuth2Api } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchDeleteOAuth2ClientApi,
  deleteOAuth2ClientApi,
  getOAuth2ClientPageApi,
} from '#/api';
import { TableAction } from '#/components';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { useBatchSelect } from '#/utils';

import { TableAdd, TableEdit } from './components';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS);

const [TableAddModal, addModal] = useVbenModal({
  connectedComponent: TableAdd,
});

const [TableEditModal, editModal] = useVbenModal({
  connectedComponent: TableEdit,
});

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('sys.oauth2.client.name'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.STATUS),
    },
    fieldName: 'status',
    label: $t('sys.oauth2.client.status'),
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

const columns: VxeGridProps<OAuth2Api.Client>['columns'] = [
  {
    type: 'checkbox',
    width: 50,
    fixed: isMobile.value ? null : 'left',
  },
  {
    field: 'id',
    minWidth: 80,
    title: $t('sys.oauth2.client.id'),
    visible: false,
  },
  {
    field: 'logo',
    minWidth: 100,
    title: $t('sys.oauth2.client.logo'),
    cellRender: {
      name: 'CellAvatar',
      props: { shape: 'square' },
      attrs: { class: '!rounded-none !bg-transparent' },
    },
  },
  {
    field: 'name',
    minWidth: 150,
    title: $t('sys.oauth2.client.name'),
  },
  {
    field: 'clientId',
    minWidth: 150,
    title: $t('sys.oauth2.client.clientId'),
  },
  {
    field: 'secret',
    minWidth: 150,
    title: $t('sys.oauth2.client.secret'),
    showOverflow: true,
  },
  {
    field: 'accessTokenValiditySeconds',
    minWidth: 150,
    title: $t('sys.oauth2.client.accessTokenValiditySeconds'),
    formatter: 'formatSeconds',
  },
  {
    field: 'refreshTokenValiditySeconds',
    minWidth: 150,
    title: $t('sys.oauth2.client.refreshTokenValiditySeconds'),
    formatter: 'formatSeconds',
  },
  {
    field: 'status',
    minWidth: 100,
    title: $t('sys.oauth2.client.status'),
    cellRender: {
      name: 'CellDict',
      props: {
        type: DictTypeEnum.STATUS,
      },
    },
  },
  {
    field: 'authorizedGrantTypes',
    minWidth: 240,
    title: $t('sys.oauth2.client.authorizedGrantTypes'),
    cellRender: { name: 'CellTags' },
  },
  {
    field: 'scopes',
    minWidth: 240,
    title: $t('sys.oauth2.client.scopes'),
    cellRender: { name: 'CellTags' },
    visible: false,
  },
  {
    field: 'autoApproveScopes',
    minWidth: 240,
    title: $t('sys.oauth2.client.autoApproveScopes'),
    cellRender: { name: 'CellTags' },
    visible: false,
  },
  {
    field: 'redirectUris',
    minWidth: 240,
    title: $t('sys.oauth2.client.redirectUris'),
    slots: { default: 'redirectUris' },
    visible: false,
  },
  {
    field: 'authorities',
    minWidth: 240,
    title: $t('sys.oauth2.client.authorities'),
    cellRender: { name: 'CellTags' },
    visible: false,
  },
  {
    field: 'resourceIds',
    minWidth: 240,
    title: $t('sys.oauth2.client.resourceIds'),
    cellRender: { name: 'CellTags' },
    visible: false,
  },
  {
    field: 'description',
    minWidth: 200,
    title: $t('sys.oauth2.client.description'),
    formatter: 'formatBlank',
    visible: false,
  },
  {
    field: 'createTime',
    minWidth: 150,
    title: $t('page.createTime'),
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

const gridOptions: VxeGridProps<OAuth2Api.Client> = {
  columns,
  height: 'auto',
  id: 'oauth2_client_manage',
  proxyConfig: {
    ajax: {
      query: ({ page }, formValues) =>
        getOAuth2ClientPageApi({
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
    auth: 'system:oauth2-client:delete',
    icon: 'ep:delete',
    onClick: async () => {
      const values = await gridApi.formApi.getValues();
      useBatchSelect<OAuth2Api.Client>({
        gridApi,
        handleBatch: (records) =>
          batchDeleteOAuth2ClientApi(records.map((item) => item.id)),
        query: values,
      });
    },
    title: $t('page.batchDelete'),
    type: 'danger',
  },
  {
    auth: 'system:oauth2-client:create',
    icon: 'ep:plus',
    onClick: () => addModal.open(),
    title: $t('page.create'),
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
        content: $t('page.edit'),
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
        title: $t('page.confirmDelete'),
      },
      tooltip: {
        content: $t('page.delete'),
      },
      type: 'danger',
    },
  ];

  return actions;
}

function requestAfter(reload = true) {
  ElMessage.success($t('page.success'));
  reload && reloadTable();
}

async function reloadTable() {
  const values = await gridApi.formApi.getValues();
  gridApi.reload(values);
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

        <TableAddModal @success="reloadTable" />
        <TableEditModal @success="reloadTable" />
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
