<script setup lang="ts">
import type {
  UploadInstance,
  UploadRawFile,
  UploadUserFile,
} from 'element-plus';

import { useVbenModal } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { useDebounceFn } from '@vueuse/core';
import { genFileId } from 'element-plus';

import { getUserImportTemplateApi } from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { downloadExcel } from '#/utils';

interface Emits {
  (e: 'confirm', file: File, updateSupport: boolean): void;
}

const emit = defineEmits<Emits>();

const MAX_UPLOAD = 1;
const uploadRef = ref<UploadInstance>();
const fileList = ref<UploadUserFile[]>([]);
const updateSupport = ref(false);
const loading = ref(false);

const { loading: downloading, runAsync: downloadTemplate } = useRequest(
  getUserImportTemplateApi,
  {
    manual: true,
  },
);

const [Modal] = useVbenModal({ onConfirm, onOpenChange });

const handleDownload = useDebounceFn(async () => {
  if (downloading.value) {
    return;
  }

  const { data } = await downloadTemplate();
  downloadExcel(data, $t('sys.user.download.template'));
});

function handleExceed(files: File[]) {
  uploadRef.value!.clearFiles();
  const uploadFiles = files.slice(-MAX_UPLOAD) as UploadRawFile[];
  uploadFiles.forEach((file) => {
    file.uid = genFileId();
    uploadRef.value!.handleStart(file);
  });
}

function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    loading.value = false;
    fileList.value = [];
    updateSupport.value = false;
  }
}

function onConfirm() {
  if (fileList.value.length === 0) {
    ElMessage.warning($t('sys.user.upload.empty'));
    return;
  }

  const file = fileList.value[0]!.raw!;
  emit('confirm', file, updateSupport.value);
  loading.value = true;
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="downloading"
    :title="$t('page.actionTitle.import', [$t('sys.user.name')])"
    class="w-11/12 lg:w-1/3 2xl:w-1/4"
    draggable
    footer-class="gap-x-0"
  >
    <ElUpload
      ref="uploadRef"
      v-model:file-list="fileList"
      :auto-upload="false"
      :limit="MAX_UPLOAD"
      accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      drag
      @exceed="handleExceed"
    >
      <div class="flex flex-col items-center gap-3">
        <IconifyIcon class="text-6xl text-gray-300" icon="ep:upload-filled" />
        <p>
          <ElText>{{ $t('sys.user.upload.dragEnter') }}</ElText>
          <ElText type="primary">
            {{ $t('sys.user.upload.title') }}
          </ElText>
        </p>
      </div>

      <template #tip>
        <div class="mt-2 flex flex-col items-center">
          <ElCheckbox
            v-model="updateSupport"
            :label="$t('sys.user.upload.support')"
          />
          <p>
            <ElText>{{ $t('sys.user.upload.limit') }}</ElText>
            <ElButton link type="primary" @click="handleDownload">
              {{ $t('sys.user.download.title') }}
            </ElButton>
          </p>
        </div>
      </template>
    </ElUpload>
  </Modal>
</template>
