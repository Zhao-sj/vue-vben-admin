<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { FileApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { ElLink } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteFileConfigApi,
  getFileConfigPageApi,
  testFileConfigApi,
  updateFileConfigMasterApi,
} from '#/api';
import { TableAction } from '#/components';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

import { TableAdd, TableEdit } from './components';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.FILE_STORAGE);

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

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('infra.file.config.name'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.FILE_STORAGE),
    },
    fieldName: 'storage',
    label: $t('infra.file.config.storage'),
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
  showCollapseButton: isMobile.value,
  wrapperClass: 'grid-cols-1 lg:grid-cols-4 2xl:grid-cols-5',
}));

const columns: VxeGridProps<FileApi.Config>['columns'] = [
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
    title: $t('infra.file.config.storage'),
    cellRender: {
      name: 'CellDict',
      props: {
        type: DictTypeEnum.FILE_STORAGE,
      },
    },
  },
  {
    field: 'master',
    minWidth: 100,
    title: $t('infra.file.config.master'),
    slots: { default: 'master' },
  },
  {
    field: 'remark',
    minWidth: 150,
    title: $t('infra.file.config.remark'),
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

const gridOptions: VxeGridProps<FileApi.Config> = {
  columns,
  checkboxConfig: {
    highlight: true,
    range: true,
  },
  id: 'file_config',
  height: 'auto',
  proxyConfig: {
    ajax: {
      query: ({ page }, formValues) =>
        getFileConfigPageApi({
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

async function reloadTable() {
  const values = gridApi.formApi.getValues();
  await gridApi.reload(values);
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
