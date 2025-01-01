<script setup lang="ts">
import type { UploadFile } from './DragUpload.vue';

import { useVbenDrawer } from '@vben/common-ui';

import { getMasterFileConfigApi, uploadFileApi } from '#/api';
import { FileStorageEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { formatFileSize, paralleTask } from '#/utils';

import DragUpload from './DragUpload.vue';

interface Emits {
  (e: 'success'): void;
}

const emit = defineEmits<Emits>();

const S3_MAX_LIMIT = 1024 * 1024 * 1024 * 5; // 5G
const OTHER_MAX_LIMIT = 1024 * 1024 * 32; // 32M
const fileList = ref<UploadFile[]>([]);
const uploadTasks = ref<ReturnType<typeof getUploadTasks>>([]);

const requestConf = {
  loadingDelay: 200,
  manual: true,
};

const {
  loading: masterLoading,
  data: masterConfig,
  runAsync: getMasterConfig,
} = useRequest(getMasterFileConfigApi, requestConf);

const [Drawer, drawer] = useVbenDrawer({ onConfirm, onOpenChange, onCancel });

const limitSize = computed(() =>
  masterConfig.value?.storage === FileStorageEnum.S3
    ? S3_MAX_LIMIT
    : OTHER_MAX_LIMIT,
);

const totalSize = computed(() =>
  fileList.value.reduce((acc, cur) => acc + cur.raw.size, 0),
);

const successCount = computed(
  () => fileList.value.filter((item) => item.status === 'success').length,
);

const uploading = computed(() =>
  uploadTasks.value.some((item) => unref(item.loading)),
);

const hasUploaded = computed(() => fileList.value.some((item) => item.status));

const confirmText = computed(() => {
  if (uploading.value) {
    return $t('page.upload.loading');
  }
  return hasUploaded.value ? $t('page.done') : $t('page.upload.start');
});

function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    getMasterConfig();
    return;
  }

  fileList.value = [];
}

function onCancel() {
  if (!uploading.value) {
    handleCancel();
    return;
  }

  ElMessageBox.confirm($t('page.upload.cancel.tip'), $t('page.systemTip'), {
    type: 'warning',
  }).then(() => {
    uploadTasks.value.forEach((item) => item.controller.abort());
    handleCancel();
  });
}

function onConfirm() {
  if (fileList.value.length === 0) {
    ElMessage.warning($t('sys.user.upload.empty'));
    return;
  }

  if (fileList.value.some((item) => item.raw.size > limitSize.value)) {
    ElMessage.error(
      $t('infra.file.list.upload.tip', [formatFileSize(limitSize.value)]),
    );
    return;
  }

  if (hasUploaded.value) {
    drawer.close();
    emit('success');
  }

  uploadTasks.value = getUploadTasks();
  const tasks = uploadTasks.value.map((item) => item.task);
  paralleTask(tasks, 3); // TODO 待优化：web worker
}

function handleCancel() {
  if (fileList.value.some((item) => item.status === 'success')) {
    emit('success');
  }
  drawer.close();
}

function handleUploadCancel(uid: number) {
  const idx = fileList.value.findIndex((item) => item.uid === uid);
  if (idx !== -1) {
    const task = uploadTasks.value[idx];
    if (task) {
      task.controller.abort();
    }
    fileList.value.splice(idx, 1);
  }
}

function getUploadTasks() {
  return fileList.value.map((item) => {
    const loading = ref(false);
    const controller = new AbortController();
    const task = () =>
      new Promise<void>((resolve) => {
        loading.value = true;
        uploadFileApi(
          { file: item.raw },
          {
            signal: controller.signal,
            onUploadProgress(e) {
              const { total = 0, loaded = 0 } = e;
              const percentage = Math.round((loaded / total) * 100);
              item.percentage = percentage;
            },
          },
        )
          .then(() => {
            item.status = 'success';
          })
          .catch(() => {
            item.status = 'exception';
          })
          .finally(() => {
            loading.value = false;
            resolve();
          });
      });

    return { loading, controller, task };
  });
}
</script>

<template>
  <Drawer
    :closable="false"
    :close-on-click-modal="false"
    :confirm-loading="uploading"
    :confirm-text
    :loading="masterLoading"
    :title="$t('page.upload.title')"
    class="w-full lg:w-1/2 2xl:w-2/5"
    footer-class="gap-x-0"
  >
    <DragUpload v-model:file-list="fileList" @cancel="handleUploadCancel">
      <template #tip>
        <div
          class="mt-2 flex flex-col items-center justify-between gap-2 md:flex-row"
        >
          <p class="self-start text-sm text-gray-500">
            {{ $t('infra.file.list.upload.tip', [formatFileSize(limitSize)]) }}
          </p>

          <div class="flex items-center gap-2 self-end">
            <ElTag size="small" type="info">
              {{ $t('infra.file.list.upload.count', [fileList.length]) }}
            </ElTag>

            <ElTag size="small" type="success">
              {{ $t('infra.file.list.upload.success', [successCount]) }}
            </ElTag>

            <ElTag size="small" type="info">
              {{
                $t('infra.file.list.upload.size', [formatFileSize(totalSize)])
              }}
            </ElTag>
          </div>
        </div>
      </template>
    </DragUpload>
  </Drawer>
</template>
