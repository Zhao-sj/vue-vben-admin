<script setup lang="ts">
import type { VxeGridProps } from 'vxe-table';

import { useVbenModal } from '@vben/common-ui';

import {
  batchDeleteDictDataApi,
  deleteDictDataApi,
  type DictApi,
  exportDictDataApi,
  getDictDataPageListApi,
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

type DictColumns = VxeGridProps<DictApi.Data>['columns'];

const { currentRoute } = useRouter();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS);

let dictQuery: DictApi.DataPageQuery = {
  dictTypeId: +currentRoute.value.params.id!,
};
const vxeBasicTableRef = ref<InstanceType<typeof VxeBasicTable>>();

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

const vxeTable = computed(() =>
  vxeBasicTableRef.value?.getTableInstance<DictApi.Data>(),
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
    title: $t('zen.service.dict.code'),
  },
  {
    align: 'center',
    field: 'label',
    minWidth: 150,
    title: $t('zen.service.dict.label'),
  },
  {
    align: 'center',
    field: 'value',
    minWidth: 150,
    title: $t('zen.service.dict.value'),
  },
  {
    align: 'center',
    field: 'sort',
    minWidth: 80,
    title: $t('zen.service.dict.sort'),
  },
  {
    align: 'center',
    field: 'color',
    minWidth: 100,
    title: $t('zen.service.dict.color'),
  },
  {
    align: 'center',
    field: 'status',
    minWidth: 100,
    slots: { default: 'status' },
    title: $t('zen.service.dict.status'),
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
    auth: 'system:dict:delete',
    icon: 'ep:delete',
    onClick: () => vxeTable.value?.commitProxy('delete'),
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

const tableOpts = reactive<VxeGridProps<DictApi.Data>>({
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
        return batchDeleteDictDataApi(ids);
      },
      query: ({ page: { currentPage, pageSize } }) =>
        getDictDataPageListApi({
          pageNum: currentPage,
          pageSize,
          ...dictQuery,
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
  const { data } = await exportDict(dictQuery);
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
  </VxeBasicTable>
</template>
