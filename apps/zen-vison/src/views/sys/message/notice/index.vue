<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { NoticeApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchDeleteNoticeApi,
  deleteNoticeApi,
  getNoticePageListApi,
  pushNoticeApi,
} from '#/api';
import { TableAction } from '#/components';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { useBatchSelect } from '#/utils';

import { TableAdd, TableEdit } from './components';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS, DictTypeEnum.NOTICE_TYPE);

const requestConfig = {
  loadingDelay: 200,
  manual: true,
};

const { runAsync: pushNotice } = useRequest(pushNoticeApi, requestConfig);

const [TableAddModal, addModal] = useVbenDrawer({
  connectedComponent: TableAdd,
});

const [TableEditModal, editModal] = useVbenDrawer({
  connectedComponent: TableEdit,
});

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    fieldName: 'title',
    label: $t('sys.message.notice.title'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.STATUS),
    },
    fieldName: 'status',
    label: $t('sys.message.notice.status'),
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

const columns: VxeGridProps<NoticeApi.Notice>['columns'] = [
  {
    type: 'checkbox',
    width: 50,
    fixed: isMobile.value ? null : 'left',
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
    title: $t('sys.message.notice.type'),
    cellRender: {
      name: 'CellDict',
      props: {
        type: DictTypeEnum.NOTICE_TYPE,
      },
    },
  },
  {
    field: 'status',
    minWidth: 100,
    title: $t('sys.message.notice.status'),
    cellRender: {
      name: 'CellDict',
      props: {
        type: DictTypeEnum.STATUS,
      },
    },
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
    width: 240,
    fixed: isMobile.value ? null : 'right',
    slots: { default: 'opt' },
  },
];

const gridOptions: VxeGridProps<NoticeApi.Notice> = {
  columns,
  height: 'auto',
  checkboxConfig: {
    highlight: true,
    range: true,
  },
  id: 'dict_data_manage',
  proxyConfig: {
    ajax: {
      query: ({ page }, formValues) =>
        getNoticePageListApi({
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
    auth: 'system:notice:delete',
    icon: 'ep:delete',
    btnText: $t('page.delete'),
    onClick: async () => {
      const formValues = await gridApi.formApi.getValues();
      useBatchSelect<NoticeApi.Notice>({
        gridApi,
        handleBatch: (records) =>
          batchDeleteNoticeApi(records.map((item) => item.id)),
        query: formValues,
      });
    },
    type: 'danger',
  },
  {
    auth: 'system:notice:create',
    icon: 'ep:plus',
    btnText: $t('page.create'),
    onClick: () => addModal.open(),
    type: 'primary',
  },
]);

function createActions(row: NoticeApi.Notice) {
  const actions: ActionItem[] = [
    {
      auth: 'system:dict:update',
      icon: 'ep:edit',
      btnText: $t('page.edit'),
      onClick: () => {
        editModal.setData({ id: row.id });
        editModal.open();
      },
      type: 'primary',
    },
    {
      auth: 'system:dict:delete',
      icon: 'ep:delete',
      btnText: $t('page.delete'),
      popConfirm: {
        on: {
          confirm: () => deleteNoticeApi(row.id).then(requestAfter),
        },
        title: $t('page.confirmDelete'),
      },
      type: 'danger',
    },
    {
      auth: 'system:notice:push',
      icon: 'ion:push-outline',
      btnText: $t('sys.message.notice.push.title'),
      popConfirm: {
        on: {
          confirm: () => pushNotice(row.id).then(() => requestAfter(false)),
        },
        title: $t('sys.message.notice.push.tip'),
      },
      type: 'warning',
    },
  ];

  return actions;
}

async function reloadTable() {
  const formValues = await gridApi.formApi.getValues();
  gridApi.reload(formValues);
}

function requestAfter(reload = true) {
  ElMessage.success($t('page.success'));
  reload && reloadTable();
}
</script>

<template>
  <Page auto-content-height>
    <Grid
      :table-title="$t('sys.message.notice.list')"
      :form-options="formOptions"
    >
      <template #toolbar-tools>
        <TableAction
          :actions="toolbarActions"
          :link="false"
          :show-empty="false"
        />

        <TableAddModal @success="reloadTable" />
        <TableEditModal @success="reloadTable" />
      </template>

      <template #opt="{ row }">
        <TableAction :actions="createActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
