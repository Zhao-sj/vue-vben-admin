<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { FileApi } from '#/api';
import type { ActionItem } from '#/components';

import { globalShareState, Page, useVbenDrawer } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';
import { IconifyIcon } from '@vben/icons';

import { useClipboard } from '@vueuse/core';

import { useGridHelper, useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteFileApi, getFilePageApi } from '#/api';
import { TableAction } from '#/components';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import { FileUpload, VideoPreview } from './modules';

const { isMobile } = useIsMobile();
const { copy } = useClipboard({ legacy: true });

const [FileUploadDrawer, uploadDrawerApi] = useVbenDrawer({
  connectedComponent: FileUpload,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    collapsed: isMobile.value,
    commonConfig: {
      componentProps: {
        clearable: true,
      },
      labelWidth: 80,
    },
    schema: useGridFormSchema(),
    submitOnEnter: true,
    showCollapseButton: isMobile.value,
    wrapperClass: 'grid-cols-1 lg:grid-cols-4 2xl:grid-cols-5',
  },
  gridOptions: {
    columns: useColumns(onActionClick),
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
  } as VxeTableGridOptions<FileApi.FileItem>,
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

const { reloadTable, onSuccess } = useGridHelper<FileApi.FileItem>(gridApi);

const toolbarActions = computed<ActionItem[]>(() => [
  {
    icon: 'ep:upload',
    btnText: $t('page.upload.action'),
    onClick: () => uploadDrawerApi.open(),
    type: 'primary',
  },
]);

function onActionClick({ code, row }: OnActionClickParams<FileApi.FileItem>) {
  switch (code) {
    case 'delete': {
      deleteFileApi(row.id).then(onSuccess);
      break;
    }
    default: {
      break;
    }
  }
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
</script>

<template>
  <Page auto-content-height>
    <FileUploadDrawer @success="reloadTable" />

    <Grid :table-title="$t('infra.file.list.list')">
      <template #toolbar-tools>
        <TableAction
          :actions="toolbarActions"
          :link="false"
          :show-empty="false"
        />
      </template>

      <template #preview="{ row: { url } }">
        <div class="flex justify-center">
          <ElImage
            v-if="isImageUrl(url)"
            :preview-src-list="[url]"
            :src="url"
            class="h-16 rounded-md"
            preview-teleported
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
    </Grid>
  </Page>
</template>
