<script setup lang="ts">
import type { VxeGridProps } from 'vxe-table';

import { useVbenModal } from '@vben/common-ui';

import {
  batchDeletePostApi,
  deletePostApi,
  exportPostApi,
  getPostPageListApi,
  type PostApi,
} from '#/api';
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

import { TableAdd, TableEdit, TableQuery } from './components';

type RoleColumns = VxeGridProps<PostApi.Post>['columns'];

const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS);

let postQuery: PostApi.PageQuery = {};
const vxeBasicTableRef = ref<InstanceType<typeof VxeBasicTable>>();

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

const vxeTable = computed(() =>
  vxeBasicTableRef.value?.getTableInstance<PostApi.Post>(),
);

const columns = computed<RoleColumns>(() => [
  {
    align: 'center',
    fixed: 'left',
    type: 'checkbox',
    width: 50,
  },
  {
    align: 'center',
    field: 'id',
    minWidth: 80,
    title: $t('zen.service.post.id'),
  },
  {
    align: 'center',
    field: 'code',
    minWidth: 150,
    title: $t('zen.service.post.code'),
  },
  {
    align: 'center',
    field: 'name',
    minWidth: 150,
    title: $t('zen.service.post.name'),
  },
  {
    align: 'center',
    field: 'sort',
    minWidth: 80,
    title: $t('zen.service.post.sort'),
  },
  {
    align: 'center',
    field: 'status',
    minWidth: 100,
    slots: { default: 'status' },
    title: $t('zen.service.post.status'),
  },
  {
    align: 'center',
    field: 'remark',
    formatter: ({ cellValue }) => cellValue || '-',
    minWidth: 200,
    title: $t('zen.common.remark'),
  },
  {
    align: 'center',
    field: 'createTime',
    formatter: ({ cellValue }) => formatToDateTime(cellValue),
    minWidth: 150,
    title: $t('zen.common.createTime'),
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
    auth: 'system:post:delete',
    icon: 'ep:delete',
    onClick: () => vxeTable.value?.commitProxy('delete'),
    title: $t('zen.common.batchDelete'),
    type: 'danger',
  },
  {
    auth: 'system:post:create',
    icon: 'ep:plus',
    onClick: () => addModal.open(),
    title: $t('zen.common.create'),
    type: 'primary',
  },
  {
    auth: 'system:post:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    onClick: () => exportModal.open(),
    title: $t('zen.common.export'),
    type: 'warning',
  },
]);

const tableOpts = reactive<VxeGridProps<PostApi.Post>>({
  checkboxConfig: {
    highlight: true,
    range: true,
  },
  customConfig: {},
  id: 'post_manage',
  pagerConfig: {
    pageSize: 20,
  },
  printConfig: {},
  proxyConfig: {
    ajax: {
      delete: ({ body: { removeRecords } }) => {
        const ids = removeRecords.map((item) => item.id);
        return batchDeletePostApi(ids);
      },
      query: ({ page: { currentPage, pageSize } }) =>
        getPostPageListApi({
          pageNum: currentPage,
          pageSize,
          ...postQuery,
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
        content: $t('zen.common.edit'),
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

function handleQuery(query: PostApi.PageQuery) {
  postQuery = query;
  vxeTable.value?.commitProxy('query');
}

function reloadTable() {
  vxeTable.value?.commitProxy('reload');
}

function requestAfter(reload = true) {
  ElMessage.success($t('zen.common.successTip'));
  reload && reloadTable();
}

async function handleExport(fileName: string) {
  if (exportLoading.value) {
    return;
  }
  const { data } = await exportPost(postQuery);
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

      <TableAddModal @success="reloadTable" />
      <TableEditModal @success="reloadTable" />
      <TableExportModal
        :default-name="$t('zen.service.post.title')"
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
  </VxeBasicTable>
</template>
