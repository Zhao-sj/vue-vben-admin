<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';

import { Page, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  batchDeleteDictTypeApi,
  deleteDictTypeApi,
  type DictApi,
  exportDictTypeApi,
  getDictTypePageListApi,
} from '#/api';
import { type ActionItem, TableAction, TableExport } from '#/components';
import { DICT_DATA_NAME, DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { downloadExcel, useBatchSelect } from '#/utils';

import { TableAdd, TableEdit } from './components';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS);

const requestConfig = {
  loadingDelay: 200,
  manual: true,
};

const { loading: exportLoading, runAsync: exportDict } = useRequest(
  exportDictTypeApi,
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
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.dict.type.name')]),
    },
    fieldName: 'name',
    label: $t('sys.dict.type.name'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.dict.type.title')]),
    },
    fieldName: 'type',
    label: $t('sys.dict.type.title'),
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
  {
    component: 'DatePicker',
    componentProps: {
      placeholder: $t('page.date.placeholder.between'),
      range: true,
      multiCalendars: {
        solo: true,
      },
    },
    fieldName: 'createTime',
    label: $t('page.createTime'),
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
  wrapperClass: 'grid-cols-1 lg:grid-cols-3',
}));

const columns: VxeGridProps<DictApi.Type>['columns'] = [
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
    field: 'name',
    minWidth: 150,
    title: $t('sys.dict.type.name'),
  },
  {
    field: 'type',
    minWidth: 200,
    title: $t('sys.dict.type.title'),
    slots: { default: 'type' },
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

const gridOptions: VxeGridProps<DictApi.Type> = {
  columns,
  height: 'auto',
  checkboxConfig: {
    highlight: true,
    range: true,
  },
  customConfig: {},
  id: 'dict_type_manage',
  proxyConfig: {
    ajax: {
      query: ({ page }, formValues) =>
        getDictTypePageListApi({
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
      const values = await gridApi.formApi.getValues();
      useBatchSelect<DictApi.Type>({
        gridApi,
        handleBatch: (records) =>
          batchDeleteDictTypeApi(records.map((item) => item.id)),
        query: values,
      });
    },
    title: $t('page.batchDelete'),
    type: 'danger',
  },
  {
    auth: 'system:dict:create',
    icon: 'ep:plus',
    onClick: () => addModal.open(),
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

function createActions(row: DictApi.Type) {
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
          confirm: () => deleteDictTypeApi(row.id).then(requestAfter),
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
  const { data } = await exportDict(values);
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
          :default-name="$t('sys.dict.type.title')"
          @confirm="handleExport"
        />
      </template>

      <template #type="{ row }">
        <ElText
          class="cursor-pointer"
          tag="ins"
          type="primary"
          @click="
            $router.push({ name: DICT_DATA_NAME, params: { id: row.id } })
          "
        >
          {{ row.type }}
        </ElText>
      </template>

      <template #opt="{ row }">
        <TableAction :actions="createActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
