<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { FileApi } from '#/api';
import type { ActionItem } from '#/components';

import { globalShareState, Page, useVbenDrawer } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';
import { IconifyIcon } from '@vben/icons';

import { useClipboard } from '@vueuse/core';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteFileApi, getFilePageApi } from '#/api';
import { TableAction } from '#/components';
import { $t } from '#/locales';

import { FileUpload, VideoPreview } from './components';

const { isMobile } = useIsMobile();
const { copy } = useClipboard({ legacy: true });

const [FileUploadDrawer, uploadDrawer] = useVbenDrawer({
  connectedComponent: FileUpload,
});

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    fieldName: 'path',
    label: $t('infra.file.list.path'),
  },
  {
    component: 'Input',
    fieldName: 'type',
    label: $t('infra.file.list.type'),
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

const columns: VxeGridProps<FileApi.FileItem>['columns'] = [
  {
    field: 'id',
    minWidth: 80,
    title: $t('infra.file.list.id'),
  },
  {
    field: 'name',
    minWidth: 150,
    title: $t('infra.file.list.name'),
    showOverflow: true,
  },
  {
    field: 'path',
    minWidth: 200,
    title: $t('infra.file.list.path'),
    showOverflow: true,
  },
  {
    field: 'url',
    minWidth: 300,
    title: $t('infra.file.list.url'),
    showOverflow: true,
  },
  {
    field: 'type',
    minWidth: 100,
    title: $t('infra.file.list.type'),
    showOverflow: true,
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
    title: $t('infra.file.list.preview.title'),
    slots: { default: 'preview' },
    showOverflow: false,
  },
  {
    field: 'createTime',
    minWidth: 150,
    title: $t('infra.file.list.createTime'),
    formatter: 'formatDateTime',
  },
  {
    field: 'opt',
    title: $t('page.options'),
    width: 120,
    slots: { default: 'opt' },
    fixed: isMobile.value ? null : 'right',
  },
];

const gridOptions: VxeGridProps<FileApi.FileItem> = {
  columns,
  checkboxConfig: {
    highlight: true,
    range: true,
  },
  id: 'file_list',
  height: 'auto',
  proxyConfig: {
    ajax: {
      query: ({ page }, formValues) =>
        getFilePageApi({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        }),
    },
  },
  menuConfig: {
    body: {
      options: [
        [
          {
            code: 'copy',
            name: '复制内容',
            prefixConfig: { icon: 'vxe-icon-copy' },
            visible: true,
            disabled: false,
          },
        ],
      ],
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions,
  gridEvents: {
    cellMenu({ row }: any) {
      gridApi.grid?.setCurrentRow(row);
    },
    menuClick({ menu, row, column }: any) {
      switch (menu.code) {
        case 'copy': {
          if (row && column) {
            copy(row[column.field]).then(() => {
              const message = globalShareState.getMessage();
              message.copyPreferencesSuccess?.(
                $t('page.successTip'),
                $t('page.copied'),
              );
            });
          }
          break;
        }
      }
    },
  },
});

const toolbarActions = computed<ActionItem[]>(() => [
  {
    icon: 'ep:upload',
    onClick: () => uploadDrawer.open(),
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

function isVideoUrl(url: string) {
  const videoExtensions = [
    '.mp4',
    '.avi',
    '.mov',
    '.mkv',
    '.flv',
    '.wmv',
    '.webm',
  ];
  return videoExtensions.some((ext) => url.endsWith(ext));
}

async function reloadTable() {
  const values = await gridApi.formApi.getValues();
  gridApi.query(values);
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

        <FileUploadDrawer @success="reloadTable" />
      </template>

      <template #preview="{ row: { url } }">
        <div class="flex justify-center">
          <ElImage
            v-if="isImageUrl(url)"
            :preview-src-list="[url]"
            :src="url"
            class="h-16 rounded-md"
            lazy
          />

          <VideoPreview v-else-if="isVideoUrl(url)" :url />

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
