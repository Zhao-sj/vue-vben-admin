<script setup lang="ts">
import { Page, useVbenModal } from '@vben/common-ui';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  batchDeletePostApi,
  deletePostApi,
  exportPostApi,
  getPostPageListApi,
  type PostApi,
} from '#/api';
import { type ActionItem, TableAction, TableExport } from '#/components';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { downloadExcel, useBatchSelect } from '#/utils';

import { TableAdd, TableEdit, TableQuery } from './components';

type RoleColumns = VxeGridProps<PostApi.Post>['columns'];

const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS);

let postQuery: PostApi.PageQuery = {};

const requestConfig = {
  loadingDelay: 200,
  manual: true,
};

const { loading: exportLoading, runAsync: exportPost } = useRequest(
  exportPostApi,
  requestConfig,
);

const [TableAddModal, addModal] = useVbenModal({
  connectedComponent: TableAdd,
});

const [TableEditModal, editModal] = useVbenModal({
  connectedComponent: TableEdit,
});

const [TableExportModal, exportModal] = useVbenModal({
  connectedComponent: TableExport,
});

const columns: RoleColumns = [
  {
    fixed: 'left',
    type: 'checkbox',
    width: 50,
  },
  {
    field: 'id',
    minWidth: 80,
    title: $t('sys.post.id'),
  },
  {
    field: 'code',
    minWidth: 150,
    title: $t('sys.post.code'),
  },
  {
    field: 'name',
    minWidth: 150,
    title: $t('sys.post.name'),
  },
  {
    field: 'sort',
    minWidth: 80,
    title: $t('sys.post.sort'),
  },
  {
    field: 'status',
    minWidth: 100,
    slots: { default: 'status' },
    title: $t('sys.post.status'),
  },
  {
    field: 'remark',
    formatter: 'formatBlank',
    minWidth: 200,
    title: $t('page.remark'),
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

const gridOptions: VxeGridProps<PostApi.Post> = {
  columns,
  checkboxConfig: {
    highlight: true,
    range: true,
  },
  customConfig: {},
  id: 'post_manage',
  height: 'auto',
  proxyConfig: {
    ajax: {
      query: ({ page: { currentPage, pageSize } }) =>
        getPostPageListApi({
          pageNum: currentPage,
          pageSize,
          ...postQuery,
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
    auth: 'system:post:delete',
    icon: 'ep:delete',
    onClick: () => {
      useBatchSelect<PostApi.Post>({
        gridApi,
        handleBatch: (records) =>
          batchDeletePostApi(records.map((item) => item.id)),
        query: postQuery,
      });
    },
    title: $t('page.batchDelete'),
    type: 'danger',
  },
  {
    auth: 'system:post:create',
    icon: 'ep:plus',
    onClick: () => addModal.open(),
    title: $t('page.create'),
    type: 'primary',
  },
  {
    auth: 'system:post:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    onClick: () => exportModal.open(),
    title: $t('page.export.title'),
    type: 'warning',
  },
]);

function createActions(row: PostApi.Post) {
  const actions: ActionItem[] = [
    {
      auth: 'system:post:update',
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
      auth: 'system:post:delete',
      icon: 'ep:delete',
      popConfirm: {
        on: {
          confirm: () => deletePostApi(row.id).then(requestAfter),
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

function handleQuery(query: PostApi.PageQuery) {
  postQuery = query;
  gridApi.query();
}

function reloadTable() {
  gridApi.reload(postQuery);
}

function requestAfter(reload = true) {
  ElMessage.success($t('page.successTip'));
  reload && reloadTable();
}

async function handleExport(fileName: string) {
  if (exportLoading.value) {
    return;
  }
  const { data } = await exportPost(postQuery);
  downloadExcel(data, fileName);
  exportModal.close();
  ElMessage.success($t('page.export.success'));
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
        <TableExportModal
          :default-name="$t('sys.post.title')"
          @confirm="handleExport"
        />
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
