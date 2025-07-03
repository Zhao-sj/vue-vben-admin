<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { ActionItem } from '#/components';

import { useIsMobile } from '@vben/hooks';
import { IconifyIcon } from '@vben/icons';

import { genFileId } from 'element-plus';

import { TableAction } from '#/components';
import { $t } from '#/locales';
import { formatFileSize } from '#/utils';

interface Emits {
  (e: 'cancel', uid: number): void;
}

export interface UploadFile {
  uid: number;
  status?: 'exception' | 'success';
  percentage?: number;
  raw: File;
}

const emit = defineEmits<Emits>();

const fileList = defineModel<UploadFile[]>('fileList', { default: () => [] });

const { isMobile } = useIsMobile();

const dragAreaRef = ref<HTMLDivElement>();
const uploadRef = ref<HTMLInputElement>();
const dragging = ref(false);

const columns: VxeGridProps<UploadFile>['columns'] = [
  {
    field: 'raw.name',
    minWidth: 150,
    title: $t('infra.file.list.name'),
    showOverflow: true,
  },
  {
    field: 'raw.type',
    minWidth: 100,
    title: $t('infra.file.list.type'),
    showOverflow: true,
  },
  {
    field: 'raw.size',
    minWidth: 100,
    title: $t('infra.file.list.size'),
    formatter: 'formatFileSize',
  },
  {
    field: 'progress',
    minWidth: 150,
    title: $t('infra.file.list.status'),
    slots: { default: 'progress' },
  },
  {
    title: $t('page.options'),
    width: 100,
    slots: { default: 'opt' },
    fixed: isMobile.value ? null : 'right',
  },
];

function createActions(row: UploadFile) {
  const actions: ActionItem[] = [
    {
      icon: 'ep:delete',
      popConfirm: {
        on: {
          confirm: () => {
            emit('cancel', row.uid);
          },
        },
        title: $t('page.confirmDelete'),
      },
      type: 'danger',
    },
  ];

  return actions;
}

function formatUploadFile(file: File[]) {
  return file.map((file) => {
    const uploadFile = {
      uid: genFileId(),
      raw: file,
    };
    return uploadFile;
  });
}

/** 获取拖入文件 */
async function getFilesByDrop(items: DataTransferItemList) {
  const files: File[] = [];

  function processEntry(entry: FileSystemEntry): Promise<void> {
    return new Promise((resolve) => {
      if (entry.isFile) {
        const fileEntry = entry as FileSystemFileEntry;
        fileEntry.file((file) => {
          files.push(file);
          resolve();
        });
      } else if (entry.isDirectory) {
        const dirEntry = entry as FileSystemDirectoryEntry;
        const dirReader = dirEntry.createReader();
        dirReader.readEntries((entries) => {
          Promise.all(entries.map(processEntry)).then(() => resolve());
        });
      } else {
        resolve();
      }
    });
  }

  const entries = [...items]
    .map((item) => item.webkitGetAsEntry())
    .filter((entry) => entry !== null);

  await Promise.all(entries.map(processEntry));
  return files;
}

function handleUploadChange(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (files) {
    const uploadFiles = formatUploadFile([...files]);
    fileList.value = uploadFiles;
  }
}

function handleDragEnter(e: DragEvent) {
  e.preventDefault();
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
  dragging.value = true;
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault();
  dragging.value = false;
}

async function handleDragDrop(e: DragEvent) {
  e.preventDefault();
  dragging.value = false;
  const items = e.dataTransfer?.items;
  if (items) {
    const files = await getFilesByDrop(items);
    const uploadFiles = formatUploadFile(files);
    fileList.value = uploadFiles;
  }
}

/** 注册事件 */
function handleAddEventListener() {
  const dragArea = dragAreaRef.value;
  if (dragArea) {
    dragArea.addEventListener('dragenter', handleDragEnter);
    dragArea.addEventListener('dragover', handleDragOver);
    dragArea.addEventListener('dragleave', handleDragLeave);
    dragArea.addEventListener('drop', handleDragDrop);
  }

  if (uploadRef.value) {
    uploadRef.value.addEventListener('change', handleUploadChange);
  }
}

/** 取消事件 */
function handleRemoveEventListener() {
  const dragArea = dragAreaRef.value;
  if (dragArea) {
    dragArea.removeEventListener('dragenter', handleDragEnter);
    dragArea.removeEventListener('dragover', handleDragOver);
    dragArea.removeEventListener('dragleave', handleDragLeave);
    dragArea.removeEventListener('drop', handleDragDrop);
  }

  if (uploadRef.value) {
    uploadRef.value.removeEventListener('change', handleUploadChange);
  }
}

onMounted(handleAddEventListener);
onUnmounted(handleRemoveEventListener);
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="mb-2">
      <div
        ref="dragAreaRef"
        :class="{ 'border-primary border-2': dragging }"
        class="hover:border-primary flex h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed transition-colors 2xl:h-48"
        @click="uploadRef?.click()"
      >
        <IconifyIcon class="text-6xl text-gray-300" icon="ep:upload-filled" />
        <p>
          <ElText>{{ $t('sys.user.upload.dragEnter') }}</ElText>
          <ElText type="primary">
            {{ $t('sys.user.upload.title') }}
          </ElText>
        </p>
        <input ref="uploadRef" class="hidden" multiple type="file" />
      </div>

      <slot name="tip"></slot>
    </div>

    <div class="flex-1 overflow-hidden rounded-md border border-b-0">
      <ElTable :data="fileList" height="100%" stripe>
        <ElTableColumn
          v-for="column in columns"
          :key="column.field"
          :fixed="column.fixed!"
          :label="column.title"
          :min-width="column.minWidth"
          :prop="column.field"
          :show-overflow-tooltip="!!column.showOverflow"
          :width="column.width"
          align="center"
        >
          <template #default="{ row }">
            <div v-if="column.formatter === 'formatFileSize'">
              {{ formatFileSize(row.raw.size) }}
            </div>

            <div v-if="column.slots?.default === 'progress'">
              <Transition mode="out-in" name="fade">
                <ElTag v-if="!row.percentage" disable-transitions>
                  {{ $t('infra.file.list.upload.wait') }}
                </ElTag>

                <ElProgress
                  v-else
                  :percentage="row.percentage"
                  :status="row.status"
                  :striped-flow="!row.status"
                  :stroke-width="16"
                  show-text
                  striped
                  text-inside
                />
              </Transition>
            </div>

            <div v-if="column.slots?.default === 'opt'">
              <TableAction :actions="createActions(row)" show-empty link />
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-progress-bar__innerText) {
  vertical-align: baseline;
}
</style>
