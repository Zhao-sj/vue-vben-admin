<script setup lang="ts">
import { Page, useVbenModal } from '@vben/common-ui';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  batchDeleteDictDataApi,
  deleteDictDataApi,
  type DictApi,
  exportDictDataApi,
  getDictDataPageListApi,
} from '#/api';
import { type ActionItem, TableAction, TableExport } from '#/components';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { downloadExcel, useBatchSelect } from '#/utils';

import { TableAdd, TableEdit, TableQuery } from './components';

type DictColumns = VxeGridProps<DictApi.Data>['columns'];

const { currentRoute } = useRouter();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS);

let dictQuery: DictApi.DataPageQuery = {
  dictTypeId: +currentRoute.value.params.id!,
};

const requestConfig = {
  loadingDelay: 200,
  manual: true,
};

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

const columns: DictColumns = [
  {
    fixed: 'left',
    type: 'checkbox',
    width: 50,
  },
  {
    field: 'id',
    minWidth: 80,
    title: $t('zen.service.dict.code'),
  },
  {
    field: 'label',
    minWidth: 150,
    title: $t('zen.service.dict.label'),
  },
  {
    field: 'value',
    minWidth: 150,
    title: $t('zen.service.dict.value'),
  },
  {
    field: 'sort',
    minWidth: 80,
    title: $t('zen.service.dict.sort'),
  },
  {
    field: 'color',
    minWidth: 100,
    title: $t('zen.service.dict.color'),
  },
  {
    field: 'status',
    minWidth: 100,
    slots: { default: 'status' },
    title: $t('zen.service.dict.status'),
  },
  {
    field: 'remark',
    formatter: ({ cellValue }) => cellValue || '-',
    minWidth: 200,
    title: $t('zen.common.remark'),
  },
  {
    field: 'createTime',
    formatter: 'formatDateTime',
    minWidth: 150,
    title: $t('zen.common.createTime'),
  },
  {
    fixed: 'right',
    slots: { default: 'opt' },
    title: $t('zen.common.opt'),
    width: 120,
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
      delete: ({ body: { removeRecords } }) => {
        const ids = removeRecords.map((item) => item.id);
        return batchDeleteDictDataApi(ids);
      },
      query: ({ page: { currentPage, pageSize } }) =>
        getDictDataPageListApi({
          pageNum: currentPage,
          pageSize,
          ...dictQuery,
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
    auth: 'system:dict:delete',
    icon: 'ep:delete',
    onClick: () => {
      useBatchSelect<DictApi.Data>({
        gridApi,
        handleBatch: (records) =>
          batchDeleteDictDataApi(records.map((item) => item.id)),
        query: dictQuery,
      });
    },
    title: $t('zen.common.batchDelete'),
    type: 'danger',
  },
  {
    auth: 'system:dict:create',
    icon: 'ep:plus',
    onClick: () => {
      addModal.setData({ typeId: dictQuery.dictTypeId });
      addModal.open();
    },
    title: $t('zen.common.create'),
    type: 'primary',
  },
  {
    auth: 'system:dict:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    onClick: () => exportModal.open(),
    title: $t('zen.common.export'),
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
        content: $t('zen.common.edit'),
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

function handleQuery(query: DictApi.DataPageQuery) {
  dictQuery = query;
  gridApi.query();
}

function reloadTable() {
  gridApi.reload(dictQuery);
}

function requestAfter(reload = true) {
  ElMessage.success($t('zen.common.successTip'));
  reload && reloadTable();
}

async function handleExport(fileName: string) {
  if (exportLoading.value) {
    return;
  }
  const { data } = await exportDict(dictQuery);
  downloadExcel(data, fileName);
  exportModal.close();
  ElMessage.success($t('zen.export.success'));
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
          :default-name="$t('zen.service.dict.dataTitle')"
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
