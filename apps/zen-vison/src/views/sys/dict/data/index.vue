<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';

import { Page, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  batchDeleteDictDataApi,
  deleteDictDataApi,
  type DictApi,
  exportDictDataApi,
  getDictDataPageListApi,
  getDictTypeSimpleListApi,
} from '#/api';
import { type ActionItem, TableAction, TableExport } from '#/components';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { downloadExcel, useBatchSelect } from '#/utils';

import { TableAdd, TableEdit } from './components';

const { currentRoute } = useRouter();
const { isMobile } = useIsMobile();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS);

const requestConfig = {
  loadingDelay: 200,
  manual: true,
};

const { data: dictTypeList, loading } = useRequest(getDictTypeSimpleListApi);

const { loading: exportLoading, runAsync: exportDict } = useRequest(
  exportDictDataApi,
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

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Select',
    componentProps: {
      clearable: false,
      loading,
      placeholder: $t('page.pleaseSelect', [$t('sys.dict.type.title')]),
      options: dictTypeList.value?.map((item) => ({
        label: item.name,
        value: item.id,
      })),
      onChange: reloadTable,
    },
    defaultValue: +currentRoute.value.params.id!,
    fieldName: 'dictTypeId',
    label: $t('sys.dict.type.title'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.dict.data.label')]),
    },
    fieldName: 'label',
    label: $t('sys.dict.data.label'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.STATUS),
      placeholder: $t('page.pleaseSelect', [$t('sys.dict.status')]),
    },
    fieldName: 'status',
    label: $t('sys.dict.status'),
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

const columns: VxeGridProps<DictApi.Data>['columns'] = [
  {
    type: 'checkbox',
    width: 50,
    fixed: isMobile.value ? null : 'left',
  },
  {
    field: 'id',
    minWidth: 80,
    title: $t('sys.dict.id'),
  },
  {
    field: 'label',
    minWidth: 150,
    title: $t('sys.dict.data.label'),
  },
  {
    field: 'value',
    minWidth: 150,
    title: $t('sys.dict.data.value'),
  },
  {
    field: 'sort',
    minWidth: 80,
    title: $t('sys.dict.data.sort'),
  },
  {
    field: 'color',
    minWidth: 100,
    title: $t('sys.dict.data.color'),
  },
  {
    field: 'status',
    minWidth: 100,
    title: $t('sys.dict.status'),
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
    title: $t('page.options'),
    width: 120,
    fixed: isMobile.value ? null : 'right',
    slots: { default: 'opt' },
  },
];

const gridOptions: VxeGridProps<DictApi.Data> = {
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
      query: ({ page }, formValues) =>
        getDictDataPageListApi({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        }),
    },
  },
  toolbarConfig: {
    refresh: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:dict:delete',
    icon: 'ep:delete',
    onClick: async () => {
      const formValues = await gridApi.formApi.getValues();
      useBatchSelect<DictApi.Data>({
        gridApi,
        handleBatch: (records) =>
          batchDeleteDictDataApi(records.map((item) => item.id)),
        query: formValues,
      });
    },
    title: $t('page.batchDelete'),
    type: 'danger',
  },
  {
    auth: 'system:dict:create',
    icon: 'ep:plus',
    onClick: async () => {
      const formValues = await gridApi.formApi.getValues();
      addModal.setData({ typeId: formValues.dictTypeId });
      addModal.open();
    },
    title: $t('page.create'),
    type: 'primary',
  },
  {
    auth: 'system:dict:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    onClick: () => exportModal.open(),
    title: $t('page.export.title'),
    type: 'warning',
  },
]);

function createActions(row: DictApi.Data) {
  const actions: ActionItem[] = [
    {
      auth: 'system:dict:update',
      icon: 'ep:edit',
      onClick: () => {
        editModal.setData({ id: row.id, typeId: row.dictTypeId });
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
          confirm: () => deleteDictDataApi(row.id).then(requestAfter),
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

async function reloadTable() {
  const formValues = await gridApi.formApi.getValues();
  gridApi.reload(formValues);
}

function requestAfter(reload = true) {
  ElMessage.success($t('page.success'));
  reload && reloadTable();
}

async function handleExport(fileName: string) {
  if (exportLoading.value) {
    return;
  }
  const formValues = await gridApi.formApi.getValues();
  const { data } = await exportDict(formValues as DictApi.DataPageQuery);
  downloadExcel(data, fileName);
  exportModal.close();
  ElMessage.success($t('page.export.success'));
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
        <TableExportModal
          :default-name="$t('sys.dict.data.title')"
          @confirm="handleExport"
        />
      </template>

      <template #opt="{ row }">
        <TableAction :actions="createActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
