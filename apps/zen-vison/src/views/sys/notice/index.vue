<script setup lang="ts">
import { Page, useVbenModal } from '@vben/common-ui';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  batchDeleteNoticeApi,
  deleteNoticeApi,
  getNoticePageListApi,
  type NoticeApi,
  pushNoticeApi,
} from '#/api';
import { type ActionItem, TableAction } from '#/components';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { useBatchSelect } from '#/utils';

import { TableAdd, TableEdit, TableQuery } from './components';

type DictColumns = VxeGridProps<NoticeApi.Notice>['columns'];

const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS, DictTypeEnum.NOTICE_TYPE);

let noticeQuery: NoticeApi.PageQuery = {};

const requestConfig = {
  loadingDelay: 200,
  manual: true,
};

const { runAsync: pushNotice } = useRequest(pushNoticeApi, requestConfig);

const [TableAddModal, addModal] = useVbenModal({
  connectedComponent: TableAdd,
});

const [TableEditModal, editModal] = useVbenModal({
  connectedComponent: TableEdit,
});

const columns: DictColumns = [
  {
    fixed: 'left',
    type: 'checkbox',
    width: 50,
  },
  {
    field: 'id',
    minWidth: 80,
    title: $t('sys.message.notice.id'),
  },
  {
    field: 'title',
    minWidth: 200,
    title: $t('sys.message.notice.title'),
  },
  {
    field: 'type',
    minWidth: 100,
    slots: { default: 'type' },
    title: $t('sys.message.notice.type'),
  },
  {
    field: 'status',
    minWidth: 100,
    slots: { default: 'status' },
    title: $t('sys.message.notice.status'),
  },
  {
    field: 'createTime',
    formatter: 'formatDateTime',
    minWidth: 150,
    title: $t('page.createTime'),
  },
  {
    fixed: 'right',
    slots: { default: 'opt' },
    title: $t('page.options'),
    width: 120,
  },
];

const gridOptions: VxeGridProps<NoticeApi.Notice> = {
  columns,
  height: 'auto',
  checkboxConfig: {
    highlight: true,
    range: true,
  },
  customConfig: {},
  id: 'dict_data_manage',
  proxyConfig: {
    ajax: {
      query: ({ page: { currentPage, pageSize } }) =>
        getNoticePageListApi({
          pageNum: currentPage,
          pageSize,
          ...noticeQuery,
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
    auth: 'system:notice:delete',
    icon: 'ep:delete',
    onClick: () => {
      useBatchSelect<NoticeApi.Notice>({
        gridApi,
        handleBatch: (records) =>
          batchDeleteNoticeApi(records.map((item) => item.id)),
        query: noticeQuery,
      });
    },
    title: $t('page.batchDelete'),
    type: 'danger',
  },
  {
    auth: 'system:notice:create',
    icon: 'ep:plus',
    onClick: () => addModal.open(),
    title: $t('page.create'),
    type: 'primary',
  },
]);

function createActions(row: NoticeApi.Notice) {
  const actions: ActionItem[] = [
    {
      auth: 'system:dict:update',
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
      auth: 'system:dict:delete',
      icon: 'ep:delete',
      popConfirm: {
        on: {
          confirm: () => deleteNoticeApi(row.id).then(requestAfter),
        },
        title: $t('page.confirmDelete'),
      },
      tooltip: {
        content: $t('page.delete'),
      },
      type: 'danger',
    },
    {
      auth: 'system:notice:push',
      icon: 'ion:push-outline',
      popConfirm: {
        on: {
          confirm: () => pushNotice(row.id).then(() => requestAfter(false)),
        },
        title: $t('sys.message.notice.push.title'),
      },
      tooltip: {
        content: $t('sys.message.notice.push.tip'),
      },
      type: 'warning',
    },
  ];

  return actions;
}

function handleQuery(query: NoticeApi.PageQuery) {
  noticeQuery = query;
  gridApi.query();
}

function reloadTable() {
  gridApi.reload(noticeQuery);
}

function requestAfter(reload = true) {
  ElMessage.success($t('page.successTip'));
  reload && reloadTable();
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

      <template #type="{ row: { type } }">
        <ElTag :type="dictStore.getNoticeType(type)?.color">
          {{ dictStore.getNoticeType(type)?.label }}
        </ElTag>
      </template>

      <template #status="{ row: { status } }">
        <ElTag :type="dictStore.getStatus(status)?.color">
          {{ dictStore.getStatus(status)?.label }}
        </ElTag>
      </template>

      <template #opt="{ row }">
        <TableAction :actions="createActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
