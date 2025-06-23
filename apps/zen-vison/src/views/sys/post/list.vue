<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { PostApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchDeletePostApi,
  deletePostApi,
  exportPostApi,
  getPostPageListApi,
} from '#/api';
import { TableAction, TableExport } from '#/components';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { downloadExcel, useBatchSelect } from '#/utils';

import { TableAdd, TableEdit } from './modules';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS);

const requestConfig = {
  loadingDelay: 200,
  manual: true,
};

const { loading: exportLoading, runAsync: exportPost } = useRequest(
  exportPostApi,
  requestConfig,
);

const [TableAddDrawer, addDrawerApi] = useVbenDrawer({
  connectedComponent: TableAdd,
});

const [TableEditDrawer, editDrawerApi] = useVbenDrawer({
  connectedComponent: TableEdit,
});

const [TableExportModal, exportModalApi] = useVbenModal({
  connectedComponent: TableExport,
});

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    fieldName: 'code',
    label: $t('sys.post.code'),
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('sys.post.name'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.STATUS),
    },
    fieldName: 'status',
    label: $t('sys.post.status'),
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

const columns: VxeTableGridOptions<PostApi.Post>['columns'] = [
  {
    type: 'checkbox',
    width: 50,
    fixed: isMobile.value ? null : 'left',
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
    title: $t('sys.post.status'),
    cellRender: {
      name: 'CellDict',
      props: {
        type: DictTypeEnum.STATUS,
      },
    },
  },
  {
    field: 'remark',
    minWidth: 200,
    title: $t('page.remark'),
    formatter: 'formatBlank',
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
    width: 180,
    fixed: isMobile.value ? null : 'right',
    slots: { default: 'opt' },
  },
];

const gridOptions: VxeTableGridOptions<PostApi.Post> = {
  columns,
  checkboxConfig: {
    highlight: true,
    range: true,
  },
  id: 'post_manage',
  height: 'auto',
  proxyConfig: {
    ajax: {
      query: ({ page }, formValues) =>
        getPostPageListApi({
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
    auth: 'system:post:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    btnText: $t('page.export.action'),
    onClick: () => exportModalApi.open(),
  },
  {
    auth: 'system:post:delete',
    icon: 'ep:delete',
    btnText: $t('page.delete'),
    onClick: async () => {
      const values = await gridApi.formApi.getValues();
      useBatchSelect<PostApi.Post>({
        gridApi,
        handleBatch: (records) =>
          batchDeletePostApi(records.map((item) => item.id)),
        query: values,
      });
    },
    type: 'danger',
  },
  {
    auth: 'system:post:create',
    icon: 'ep:plus',
    btnText: $t('page.create'),
    onClick: () => addDrawerApi.open(),
    type: 'primary',
  },
]);

function createActions(row: PostApi.Post) {
  const actions: ActionItem[] = [
    {
      auth: 'system:post:update',
      icon: 'ep:edit',
      btnText: $t('page.edit'),
      onClick: () => {
        editDrawerApi.setData({ id: row.id });
        editDrawerApi.open();
      },
      type: 'primary',
    },
    {
      auth: 'system:post:delete',
      icon: 'ep:delete',
      btnText: $t('page.delete'),
      popConfirm: {
        on: {
          confirm: () => deletePostApi(row.id).then(requestAfter),
        },
        title: $t('page.confirmDelete'),
      },
      type: 'danger',
    },
  ];

  return actions;
}

async function reloadTable() {
  const values = await gridApi.formApi.getValues();
  gridApi.reload(values);
}

function requestAfter(reload = true) {
  ElMessage.success($t('page.success'));
  reload && reloadTable();
}

async function handleExport(fileName: string) {
  if (exportLoading.value) {
    return;
  }
  const values = await gridApi.formApi.getValues();
  const { data } = await exportPost(values);
  downloadExcel(data, fileName);
  exportModalApi.close();
  ElMessage.success($t('page.export.success'));
}
</script>

<template>
  <Page auto-content-height>
    <Grid :table-title="$t('sys.post.list')" :form-options="formOptions">
      <template #toolbar-tools>
        <TableAction
          :actions="toolbarActions"
          :link="false"
          :show-empty="false"
        />

        <TableAddDrawer @success="reloadTable" />
        <TableEditDrawer @success="reloadTable" />
        <TableExportModal
          :default-name="$t('sys.post.list')"
          @confirm="handleExport"
        />
      </template>

      <template #opt="{ row }">
        <TableAction :actions="createActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
