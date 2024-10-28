<script setup lang="ts">
import { Page, useVbenModal } from '@vben/common-ui';

import { ElLink } from 'element-plus';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  deleteFileConfigApi,
  type FileApi,
  getFileConfigPageApi,
  testFileConfigApi,
  updateFileConfigMasterApi,
} from '#/api';
import { type ActionItem, TableAction } from '#/components';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

import { TableAdd, TableEdit, TableQuery } from './components';

type FileConfigColumns = VxeGridProps<FileApi.Config>['columns'];

const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.FILE_STORAGE);

let fileConfigQuery: FileApi.ConfigPageQuery = {};

const requestConfig = {
  loadingDelay: 200,
  manual: true,
};

const { runAsync: updateMaster } = useRequest(
  updateFileConfigMasterApi,
  requestConfig,
);

const [TableAddModal, addModal] = useVbenModal({
  connectedComponent: TableAdd,
});

const [TableEditModal, editModal] = useVbenModal({
  connectedComponent: TableEdit,
});

const columns: FileConfigColumns = [
  {
    field: 'id',
    minWidth: 80,
    title: $t('infra.file.config.id'),
  },
  {
    field: 'name',
    minWidth: 150,
    title: $t('infra.file.config.name'),
  },
  {
    field: 'storage',
    minWidth: 150,
    slots: { default: 'storage' },
    title: $t('infra.file.config.storage'),
  },
  {
    field: 'master',
    minWidth: 100,
    slots: { default: 'master' },
    title: $t('infra.file.config.master'),
  },
  {
    field: 'remark',
    formatter: 'formatBlank',
    minWidth: 150,
    title: $t('infra.file.config.remark'),
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

const gridOptions: VxeGridProps<FileApi.Config> = {
  columns,
  checkboxConfig: {
    highlight: true,
    range: true,
  },
  customConfig: {},
  id: 'file_config',
  height: 'auto',
  proxyConfig: {
    ajax: {
      query: ({ page: { currentPage, pageSize } }) =>
        getFileConfigPageApi({
          pageNum: currentPage,
          pageSize,
          ...fileConfigQuery,
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
    auth: 'infra:file-config:create',
    icon: 'ep:plus',
    onClick: () => addModal.open(),
    title: $t('page.create'),
    type: 'primary',
  },
]);

function createActions(row: FileApi.Config) {
  const actions: ActionItem[] = [
    {
      auth: 'infra:file-config:update',
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
      auth: 'infra:file-config:query',
      icon: 'lucide:flask-conical',
      popConfirm: {
        on: {
          confirm: () => {
            testFileConfigApi(row.id).then(handleTestSuccess);
          },
        },
        title: $t('infra.file.config.confirm.test.title'),
      },
      tooltip: {
        content: $t('infra.file.config.test'),
      },
      type: 'warning',
    },
    {
      auth: 'infra:file-config:delete',
      icon: 'ep:delete',
      popConfirm: {
        on: {
          confirm: () => {
            deleteFileConfigApi(row.id).then(() => {
              ElMessage.success($t('page.success'));
              reloadTable();
            });
          },
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

function handleTestSuccess(url: string) {
  const title = $t('page.systemTip');
  const message = $t('infra.file.config.confirm.test.success');
  const download = h(
    ElLink,
    {
      type: 'primary',
      target: '_blank',
      href: url,
    },
    {
      default: () => $t('infra.file.config.confirm.test.download'),
    },
  );

  ElMessageBox.alert(
    h('div', { class: 'flex items-centr' }, [message, download]),
    title,
    { type: 'success' },
  );
}

function handleMasterChange(row: FileApi.Config) {
  const title = $t('page.systemTip');
  const message = $t('infra.file.config.confirm.master', [row.id]);
  const resetMaster = () => {
    row.master = !row.master;
  };

  ElMessageBox.confirm(message, title, {
    closeOnClickModal: false,
    draggable: true,
    type: 'warning',
  })
    .then(() => {
      updateMaster(row.id).then(requestAfter).catch(resetMaster);
    })
    .catch(resetMaster);
}

function requestAfter(reload = true) {
  ElMessage.success($t('page.success'));
  reload && reloadTable();
}

function reloadTable() {
  gridApi.query(fileConfigQuery);
}

function handleQuery(query: FileApi.ConfigPageQuery) {
  fileConfigQuery = query;
  gridApi.query();
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
      </template>

      <template #storage="{ row: { storage } }">
        <ElTag :type="dictStore.getFileStorage(storage)?.color">
          {{ dictStore.getFileStorage(storage)?.label }}
        </ElTag>
      </template>

      <template #master="{ row }">
        <ElSwitch
          v-model="row.master"
          :active-value="true"
          :disabled="row.master"
          :inactive-value="false"
          @change="handleMasterChange(row)"
        />
      </template>

      <template #opt="{ row }">
        <TableAction :actions="createActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
