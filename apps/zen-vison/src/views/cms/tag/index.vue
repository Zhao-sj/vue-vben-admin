<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { TagApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { batchDeleteCmsTagApi, deleteCmsTagApi, getCmsTagPageApi } from '#/api';
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
    label: $t('cms.tag.name'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.STATUS),
    },
    fieldName: 'status',
    label: $t('cms.tag.status'),
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

const columns: VxeGridProps<TagApi.Tag>['columns'] = [
  {
    type: 'checkbox',
    width: 50,
    fixed: isMobile.value ? null : 'left',
  },
  {
    field: 'id',
    minWidth: 80,
    title: $t('cms.tag.id'),
  },
  {
    field: 'name',
    minWidth: 150,
    title: $t('cms.tag.name'),
  },
  {
    field: 'status',
    minWidth: 100,
    title: $t('cms.tag.status'),
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
    width: 180,
    fixed: isMobile.value ? null : 'right',
    slots: { default: 'opt' },
  },
];

const gridOptions: VxeGridProps<TagApi.Tag> = {
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
        getCmsTagPageApi({
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
    auth: 'cms:article-tag:delete',
    icon: 'ep:delete',
    btnText: $t('page.delete'),
    onClick: async () => {
      const values = await gridApi.formApi.getValues();
      useBatchSelect<TagApi.Tag>({
        gridApi,
        handleBatch: (records) =>
          batchDeleteCmsTagApi(records.map((item) => item.id)),
        query: values,
      });
    },
    type: 'danger',
  },
  {
    auth: 'cms:article-tag:create',
    icon: 'ep:plus',
    btnText: $t('page.create'),
    onClick: () => addModal.open(),
    type: 'primary',
  },
]);

function createActions(row: TagApi.Tag) {
  const actions: ActionItem[] = [
    {
      auth: 'cms:article-tag:update',
      icon: 'ep:edit',
      btnText: $t('page.edit'),
      onClick: () => {
        editModal.setData({ id: row.id });
        editModal.open();
      },
      type: 'primary',
    },
    {
      auth: 'cms:article-tag:delete',
      icon: 'ep:delete',
      btnText: $t('page.delete'),
      popConfirm: {
        on: {
          confirm: () => deleteCmsTagApi(row.id).then(requestAfter),
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
</script>

<template>
  <Page auto-content-height>
    <Grid :table-title="$t('cms.tag.list')" :form-options="formOptions">
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
