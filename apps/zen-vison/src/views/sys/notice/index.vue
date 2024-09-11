<script setup lang="ts">
import type { VxeGridProps } from 'vxe-table';

import { useVbenModal } from '@vben/common-ui';

import {
  batchDeleteNoticeApi,
  deleteNoticeApi,
  getNoticePageListApi,
  type NoticeApi,
  pushNoticeApi,
} from '#/api';
import { type ActionItem, TableAction, VxeBasicTable } from '#/components';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { formatToDateTime } from '#/utils';

import { TableAdd, TableEdit, TableQuery } from './components';

type DictColumns = VxeGridProps<NoticeApi.Notice>['columns'];

const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS, DictTypeEnum.NOTICE_TYPE);

let noticeQuery: NoticeApi.PageQuery = {};
const vxeBasicTableRef = ref<InstanceType<typeof VxeBasicTable>>();

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

const vxeTable = computed(() =>
  vxeBasicTableRef.value?.getTableInstance<NoticeApi.Notice>(),
);

const columns = computed<DictColumns>(() => [
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
    title: $t('zen.service.notice.code'),
  },
  {
    align: 'center',
    field: 'title',
    minWidth: 200,
    title: $t('zen.service.notice.title'),
  },
  {
    align: 'center',
    field: 'type',
    minWidth: 100,
    slots: { default: 'type' },
    title: $t('zen.service.notice.type'),
  },
  {
    align: 'center',
    field: 'status',
    minWidth: 100,
    slots: { default: 'status' },
    title: $t('zen.service.notice.status'),
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
    auth: 'system:notice:delete',
    icon: 'ep:delete',
    onClick: () => vxeTable.value?.commitProxy('delete'),
    title: $t('zen.common.batchDelete'),
    type: 'danger',
  },
  {
    auth: 'system:notice:create',
    icon: 'ep:plus',
    onClick: () => addModal.open(),
    title: $t('zen.common.create'),
    type: 'primary',
  },
]);

const tableOpts = reactive<VxeGridProps<NoticeApi.Notice>>({
  checkboxConfig: {
    highlight: true,
    range: true,
  },
  customConfig: {},
  id: 'dict_data_manage',
  pagerConfig: {
    pageSize: 20,
  },
  printConfig: {},
  proxyConfig: {
    ajax: {
      delete: ({ body: { removeRecords } }) => {
        const ids = removeRecords.map((item) => item.id);
        return batchDeleteNoticeApi(ids);
      },
      query: ({ page: { currentPage, pageSize } }) =>
        getNoticePageListApi({
          pageNum: currentPage,
          pageSize,
          ...noticeQuery,
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
        content: $t('zen.common.edit'),
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
        title: $t('zen.common.confirmDelete'),
      },
      tooltip: {
        content: $t('zen.common.delete'),
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
        title: $t('zen.service.notice.pushTip'),
      },
      tooltip: {
        content: $t('zen.service.notice.push'),
      },
      type: 'warning',
    },
  ];

  return actions;
}

function handleQuery(query: NoticeApi.PageQuery) {
  noticeQuery = query;
  vxeTable.value?.commitProxy('query');
}

function reloadTable() {
  vxeTable.value?.commitProxy('reload');
}

function requestAfter(reload = true) {
  ElMessage.success($t('zen.common.successTip'));
  reload && reloadTable();
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
  </VxeBasicTable>
</template>
