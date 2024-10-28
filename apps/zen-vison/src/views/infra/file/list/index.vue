<script setup lang="ts">
import { Page, useVbenModal } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { deleteFileApi, type FileApi, getFilePageApi } from '#/api';
import { type ActionItem, TableAction } from '#/components';
import { $t } from '#/locales';

import { FileUpload, TableQuery } from './components';

type FileColumns = VxeGridProps<FileApi.FileItem>['columns'];

let fileQuery: FileApi.PageQuery = {};

const [FileUploadModal, uploadModal] = useVbenModal({
  connectedComponent: FileUpload,
});

const columns: FileColumns = [
  {
    field: 'id',
    minWidth: 80,
    title: $t('infra.file.list.id'),
  },
  {
    field: 'name',
    minWidth: 150,
    title: $t('infra.file.list.name'),
  },
  {
    field: 'path',
    minWidth: 200,
    title: $t('infra.file.list.path'),
  },
  {
    field: 'url',
    minWidth: 300,
    title: $t('infra.file.list.url'),
  },
  {
    field: 'type',
    minWidth: 100,
    title: $t('infra.file.list.type'),
  },
  {
    field: 'size',
    minWidth: 100,
    title: $t('infra.file.list.size'),
    formatter: 'formatFileSize',
  },
  {
    field: 'preview',
    minWidth: 100,
    title: $t('infra.file.list.preview'),
    slots: { default: 'preview' },
    showOverflow: false,
  },
  {
    field: 'createTime',
    formatter: 'formatDateTime',
    minWidth: 150,
    title: $t('infra.file.list.createTime'),
  },
  {
    fixed: 'right',
    slots: { default: 'opt' },
    title: $t('page.options'),
    width: 120,
  },
];

const gridOptions: VxeGridProps<FileApi.FileItem> = {
  columns,
  checkboxConfig: {
    highlight: true,
    range: true,
  },
  customConfig: {},
  id: 'file_list',
  height: 'auto',
  proxyConfig: {
    ajax: {
      query: ({ page: { currentPage, pageSize } }) =>
        getFilePageApi({
          pageNum: currentPage,
          pageSize,
          ...fileQuery,
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
    icon: 'ep:upload',
    onClick: () => uploadModal.open(),
    title: $t('page.create'),
    type: 'primary',
  },
]);

function createActions(row: FileApi.FileItem) {
  const actions: ActionItem[] = [
    {
      auth: 'infra:file:delete',
      icon: 'ep:delete',
      popConfirm: {
        on: {
          confirm: () => {
            deleteFileApi(row.id).then(() => {
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

function isImageUrl(url: string) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  return imageExtensions.some((ext) => url.endsWith(ext));
}

function reloadTable() {
  gridApi.query(fileQuery);
}

function handleQuery(query: FileApi.PageQuery) {
  fileQuery = query;
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

        <FileUploadModal @success="reloadTable" />
      </template>

      <template #preview="{ row: { url } }">
        <div class="flex justify-center">
          <ElImage
            v-if="isImageUrl(url)"
            :preview-src-list="[url]"
            :src="url"
            class="h-16"
          />

          <IconifyIcon
            v-else
            class="text-2xl text-gray-400"
            icon="lucide:file-text"
          />
        </div>
      </template>

      <template #opt="{ row }">
        <TableAction :actions="createActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
