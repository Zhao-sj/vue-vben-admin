<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import {
  genFileId,
  type UploadInstance,
  type UploadRawFile,
  type UploadUserFile,
} from 'element-plus';

import { getMasterFileConfigApi, uploadFileApi } from '#/api';
import { FileStorageEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { formatFileSize } from '#/utils';

interface Emits {
  (e: 'success'): void;
}

const emit = defineEmits<Emits>();

const MAX_UPLOAD = 1;
const S3_MAX_LIMIT = 1024 * 1024 * 1024 * 5; // 5G
const OTHER_MAX_LIMIT = 1024 * 1024 * 32; // 32M
const uploadRef = ref<UploadInstance>();
const fileList = ref<UploadUserFile[]>([]);

const requestConf = {
  loadingDelay: 200,
  manual: true,
};

const {
  loading: masterLoading,
  data: masterConfig,
  runAsync: getMasterConfig,
} = useRequest(getMasterFileConfigApi, requestConf);

const { loading, runAsync } = useRequest(uploadFileApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

const limitSize = computed(() =>
  masterConfig.value?.storage === FileStorageEnum.S3
    ? S3_MAX_LIMIT
    : OTHER_MAX_LIMIT,
);

function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    getMasterConfig();
    return;
  }

  loading.value = false;
  fileList.value = [];
}

function handleExceed(files: File[]) {
  uploadRef.value!.clearFiles();
  const uploadFiles = files.slice(-MAX_UPLOAD) as UploadRawFile[];
  uploadFiles.forEach((file) => {
    file.uid = genFileId();
    uploadRef.value!.handleStart(file);
  });
}

async function onConfirm() {
  if (fileList.value.length === 0) {
    ElMessage.warning($t('sys.user.upload.empty'));
    return;
  }

  const file = fileList.value[0]!.raw!;
  if (file.size <= 0 || file.size > limitSize.value) {
    ElMessage.error(
      $t('infra.file.list.upload.tip', [formatFileSize(limitSize.value)]),
    );
    return;
  }

  await runAsync({ file });
  ElMessage.success($t('page.success'));
  modal.close();
  emit('success');
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="masterLoading"
    :title="$t('page.upload.title')"
    class="w-11/12 lg:w-1/3 2xl:w-1/4"
    draggable
  >
    <ElUpload
      ref="uploadRef"
      v-model:file-list="fileList"
      :auto-upload="false"
      :limit="MAX_UPLOAD"
      accept="image/*, video/*, audio/*, application/pdf, application/vnd.ms-word, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation, application/vnd.wps-office.wps, application/vnd.wps-office.doc, application/vnd.wps-office.xls, application/vnd.wps-office.ppt"
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

      <template v-if="masterConfig" #tip>
        <div class="mt-2">
          <p class="text-sm text-gray-500">
            {{ $t('infra.file.list.upload.tip', [formatFileSize(limitSize)]) }}
          </p>
        </div>
      </template>
    </ElUpload>
  </Modal>
</template>
