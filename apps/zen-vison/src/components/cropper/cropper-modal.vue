<script setup lang="ts">
import type { UploadRawFile } from 'element-plus';

import type { CropendResult, UploadApi } from './typing';

import { Tippy, useVbenModal } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { isFunction, isUndefined } from 'lodash-es';

import { $t } from '#/locales';
import { dataURLtoBlob } from '#/utils';

import CropperImage from './cropper-image.vue';

interface Props {
  modalTitle?: string;
  src?: string;
  circle?: boolean;
  size?: number;
  aspectRatio?: number;
  /** 图片代理：用于处理CORS */
  proxy?: ((src: string) => string) | boolean;
  uploadApi?: UploadApi;
}

interface Emits {
  (e: 'success', data: { data: string; source: string }): void;
  (e: 'fail', info: { msg: string }): void;
}

const props = withDefaults(defineProps<Props>(), {
  modalTitle: () => $t('component.cropper.defaultTitle'),
  circle: true,
  proxy: true,
});

const emit = defineEmits<Emits>();

let filename = '';
let scaleX = 1;
let scaleY = 1;

const cropperSrc = ref<string>();
const previewSource = ref<string>();
const cropper = ref<Cropper>();
const loading = ref(false);

const cropperTools = [
  [
    {
      name: $t('component.cropper.tool.reset'),
      icon: 'lucide:rotate-cw',
      action: () => onToolbarAction('reset'),
    },
  ],
  [
    {
      name: $t('component.cropper.tool.zoom.in'),
      icon: 'lucide:zoom-in',
      action: () => onToolbarAction('zoom', 0.1),
    },
    {
      name: $t('component.cropper.tool.zoom.out'),
      icon: 'lucide:zoom-out',
      action: () => onToolbarAction('zoom', -0.1),
    },
  ],
  [
    {
      name: $t('component.cropper.tool.move.left'),
      icon: 'lucide:move-left',
      action: () => onToolbarAction('move', -2, 0),
    },
    {
      name: $t('component.cropper.tool.move.right'),
      icon: 'lucide:move-right',
      action: () => onToolbarAction('move', 2, 0),
    },
    {
      name: $t('component.cropper.tool.move.top'),
      icon: 'lucide:move-up',
      action: () => onToolbarAction('move', 0, -2),
    },
    {
      name: $t('component.cropper.tool.move.bottom'),
      icon: 'lucide:move-down',
      action: () => onToolbarAction('move', 0, 2),
    },
  ],
  [
    {
      name: $t('component.cropper.tool.rotate.left'),
      icon: 'lucide:corner-up-left',
      action: () => onToolbarAction('rotate', -45),
    },
    {
      name: $t('component.cropper.tool.rotate.right'),
      icon: 'lucide:corner-up-right',
      action: () => onToolbarAction('rotate', 45),
    },
  ],
  [
    {
      name: $t('component.cropper.tool.scale.x'),
      icon: 'lucide:move-horizontal',
      action: () => onToolbarAction('scaleX'),
    },
    {
      name: $t('component.cropper.tool.scale.y'),
      icon: 'lucide:move-vertical',
      action: () => onToolbarAction('scaleY'),
    },
  ],
];

const defaultAspectRatio = computed(() => (props.circle ? 1 : 16 / 9));

const isSquare = computed(() => props.aspectRatio === 1 || props.circle);

const [Modal, modalApi] = useVbenModal({
  onOpenChange(isOpen) {
    if (isOpen && props.src) {
      loading.value = true;
    }
  },
  onConfirm,
});

function onImageReady(cropperInstance: Cropper) {
  cropper.value = cropperInstance;
  loading.value = false;
}

function onCropend({ imgBase64 }: CropendResult) {
  previewSource.value = imgBase64;
}

// 阻止上传
function onBeforeUpload(file: UploadRawFile) {
  if (!isUndefined(props.size) && file.size > 1024 * 1024 * props.size) {
    emit('fail', { msg: $t('component.cropper.imageTooBig') });
    return false;
  }
  const reader = new FileReader();
  reader.readAsDataURL(file);
  cropperSrc.value = '';
  previewSource.value = '';
  reader.addEventListener('load', (e) => {
    cropperSrc.value = (e.target?.result as string) ?? '';
    filename = file.name;
  });
  return false;
}

function onToolbarAction(event: keyof Cropper, ...args: number[]) {
  if (event === 'scaleX') {
    scaleX = args[0] = scaleX === -1 ? 1 : -1;
  }
  if (event === 'scaleY') {
    scaleY = args[0] = scaleY === -1 ? 1 : -1;
  }
  // @ts-ignore 动态调用
  cropper.value?.[event]?.(...args);
}

function onConfirm() {
  const uploadApi = props.uploadApi;
  if (uploadApi) {
    const blob = dataURLtoBlob(previewSource.value!);
    modalApi.lock();
    uploadApi({ path: filename, file: new File([blob], filename) })
      .then((url) => {
        emit('success', { source: previewSource.value!, data: url });
        modalApi.close();
      })
      .catch(() => {
        modalApi.unlock();
      });
  }
}

function isSameOrigin(url: string) {
  try {
    const inputUrl = new URL(url, window.location.origin);
    const currentOrigin = window.location.origin;
    return inputUrl.origin === currentOrigin;
  } catch {
    return false;
  }
}

function getCropperSrc() {
  // 如果开启代理且不是同源则启用代理
  if (props.proxy && props.src && !isSameOrigin(props.src)) {
    let proxyUrl = `${import.meta.env.VITE_GLOB_API_URL}/infra/proxy/image?url=${props.src}`;
    if (isFunction(props.proxy)) {
      proxyUrl = props.proxy(props.src);
    }
    return proxyUrl;
  }

  return props.src;
}

watchEffect(() => {
  cropperSrc.value = getCropperSrc();
});
</script>

<template>
  <Modal
    :loading
    class="lg:w-2/3 2xl:w-1/2"
    :title="modalTitle"
    :confirm-text="$t('component.cropper.confirmText')"
    :fullscreen-button="false"
    :confirm-disabled="!previewSource"
    footer-class="gap-x-0"
    draggable
  >
    <div class="flex gap-1">
      <div class="w-3/5">
        <div class="bg-grid h-80 border">
          <CropperImage
            v-if="cropperSrc"
            :src="cropperSrc"
            :circle
            :height="320"
            :options="{ aspectRatio: aspectRatio || defaultAspectRatio }"
            @ready="onImageReady"
            @cropend="onCropend"
          />
        </div>

        <div class="mt-2 flex">
          <ElUpload
            accept="image/*"
            :show-file-list="false"
            :before-upload="onBeforeUpload"
          >
            <Tippy
              :content="$t('component.cropper.selectImage')"
              theme="dark"
              placement="bottom"
            >
              <ElButton type="primary" size="small">
                <IconifyIcon icon="lucide:upload" class="text-sm" />
              </ElButton>
            </Tippy>
          </ElUpload>

          <div class="ml-auto flex gap-2">
            <ElButtonGroup
              v-for="(tools, i) in cropperTools"
              :key="i"
              type="primary"
              size="small"
            >
              <template v-for="item in tools" :key="item.name">
                <ElButton
                  v-tippy="{
                    content: item.name,
                    theme: 'dark',
                    placement: 'bottom',
                  }"
                  :disabled="!cropperSrc"
                  @click="item.action"
                >
                  <IconifyIcon :icon="item.icon" class="text-sm" />
                </ElButton>
              </template>
            </ElButtonGroup>
          </div>
        </div>
      </div>

      <div class="w-2/5">
        <div
          class="mx-auto h-48 overflow-hidden border"
          :class="[{ 'size-48': isSquare }, { 'rounded-full': circle }]"
        >
          <img
            v-if="previewSource"
            class="w-full"
            :src="previewSource"
            :alt="$t('component.cropper.preview')"
          />
        </div>

        <template v-if="previewSource">
          <div
            class="mt-2 flex flex-wrap justify-between gap-2 border-t pt-2"
            :class="{
              'flex-row-reverse items-center justify-around': isSquare,
            }"
          >
            <img
              class="h-20 border"
              :class="{ 'rounded-full': circle }"
              :src="previewSource"
            />
            <img
              class="h-16 border"
              :class="{ 'rounded-full': circle }"
              :src="previewSource"
            />
            <img
              class="h-12 border"
              :class="{ 'rounded-full': circle }"
              :src="previewSource"
            />
            <img
              v-if="isSquare"
              class="h-8 border"
              :class="{ 'rounded-full': circle }"
              :src="previewSource"
            />
          </div>
        </template>
      </div>
    </div>
  </Modal>
</template>

<style lang="scss" scoped>
.bg-grid {
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC');
}
</style>
