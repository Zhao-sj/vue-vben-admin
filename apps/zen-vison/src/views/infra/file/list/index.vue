<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';

import { Page, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';
import { IconifyIcon } from '@vben/icons';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { deleteFileApi, type FileApi, getFilePageApi } from '#/api';
import { type ActionItem, TableAction } from '#/components';
import { $t } from '#/locales';

import { FileUpload } from './components';

const { isMobile } = useIsMobile();

const [FileUploadModal, uploadModal] = useVbenModal({
  connectedComponent: FileUpload,
});

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('infra.file.list.path')]),
    },
    fieldName: 'path',
    label: $t('infra.file.list.path'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('infra.file.list.type')]),
    },
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
    minWidth: 150,
    title: $t('infra.file.list.createTime'),
    formatter: 'formatDateTime',
  },
  {
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
  customConfig: {},
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
  toolbarConfig: {
    refresh: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

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
