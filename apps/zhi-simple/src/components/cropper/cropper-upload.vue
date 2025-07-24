<script setup lang="ts">
import type { ButtonProps } from 'element-plus';

import type { CSSProperties } from 'vue';

import type { UploadApi } from './typing';

import { useVbenModal } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { uploadFileApi } from '#/api';
import { $t } from '#/locales';

import CropperModal from './cropper-modal.vue';

interface Props {
  width?: number | string;
  circle?: boolean;
  aspectRatio?: number;
  showBtn?: boolean;
  btnProps?: ButtonProps;
  btnText?: string;
  modalTitle?: string;
  uploadApi?: UploadApi;
}

interface Emits {
  (e: 'change', value: { data: string; source: string }): void;
}

const props = withDefaults(defineProps<Props>(), {
  width: 200,
  circle: true,
  btnText: $t('component.cropper.selectImage'),
  uploadApi: uploadFileApi,
});

const emit = defineEmits<Emits>();

const modelValue = defineModel<string>('modelValue');

const loading = ref(false);

const imageWidth = computed(() => +`${props.width}`.replace(/px/, ''));

const iconWidth = computed(
  () => `${+`${props.width}`.replace(/px/, '') / (props.circle ? 2 : 3)}px`,
);

const imageWrapperStyle = computed<CSSProperties>(() => ({
  width: `${unref(imageWidth)}px`,
  height: `${props.circle || props.aspectRatio === 1 ? unref(imageWidth) : (9 / 16) * unref(imageWidth)}px`,
}));

const [CropperUploadModal, modalApi] = useVbenModal({
  connectedComponent: CropperModal,
});

function onAfterImageLoad() {
  loading.value = false;
}

function onUploadSuccess({ data, source }: { data: string; source: string }) {
  modelValue.value = data;
  emit('change', { data, source });
  ElMessage.success($t('component.cropper.uploadSuccess'));
}

watch(
  modelValue,
  (newVal, oldVal) => {
    if (!oldVal && newVal) {
      loading.value = true;
    }
  },
  { once: true },
);
</script>

<template>
  <div>
    <div class="w-fit text-center">
      <div
        v-loading="loading"
        class="group relative cursor-pointer overflow-hidden rounded-lg border"
        :class="{ '!rounded-full': circle }"
        :style="imageWrapperStyle"
        @click="modalApi.open()"
      >
        <div
          class="absolute inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 opacity-0 duration-300 group-hover:opacity-100"
        >
          <IconifyIcon
            class="text-gray-200"
            icon="lucide:cloud-upload"
            :style="{ fontSize: iconWidth }"
          />
        </div>

        <img
          v-if="modelValue"
          class="w-full"
          :src="modelValue"
          alt="avatar"
          @load="onAfterImageLoad"
          @error="onAfterImageLoad"
        />
      </div>

      <ElButton
        v-if="showBtn"
        v-bind="btnProps"
        class="mt-2"
        @click="modalApi.open()"
      >
        {{ btnText }}
      </ElButton>
    </div>

    <CropperUploadModal
      :circle
      :modal-title
      :aspect-ratio
      :src="modelValue"
      :upload-api
      @success="onUploadSuccess"
    />
  </div>
</template>
