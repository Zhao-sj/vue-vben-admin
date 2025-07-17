<script setup lang="ts">
import type { CSSProperties } from 'vue';

import type { Nullable } from '@vben/types';

import type { CropendResult } from './typing';

import { useDebounceFn } from '@vueuse/core';
import Cropper from 'cropperjs';

import 'cropperjs/dist/cropper.css';

type Options = Cropper.Options;

interface Props {
  src: string;
  alt?: string;
  circle?: boolean;
  realTimePreview?: boolean;
  height?: number | string;
  crossorigin?: 'anonymous' | 'use-credentials';
  imageStyle?: CSSProperties;
  options?: Options;
}

interface Emits {
  (e: 'cropend', data: CropendResult): void;
  (e: 'ready', cropper: Cropper): void;
  (e: 'cropendError'): void;
}

const props = withDefaults(defineProps<Props>(), {
  realTimePreview: true,
  height: '360px',
});

const emit = defineEmits<Emits>();

const defaultOptions: Options = {
  aspectRatio: 1,
  zoomable: true,
  zoomOnTouch: true,
  zoomOnWheel: true,
  cropBoxMovable: true,
  cropBoxResizable: true,
  toggleDragModeOnDblclick: true,
  autoCrop: true,
  background: true,
  highlight: true,
  center: true,
  responsive: true,
  restore: true,
  checkCrossOrigin: true,
  checkOrientation: true,
  scalable: true,
  modal: true,
  guides: true,
  movable: true,
  rotatable: true,
};

const imgRef = useTemplateRef('image');
const cropper = ref<Nullable<Cropper>>();
const isReady = ref(false);

const getImageStyle = computed<CSSProperties>(() => ({
  height: props.height,
  maxWidth: '100%',
  ...props.imageStyle,
}));

const debounceRealTimeCroppered = useDebounceFn(realTimeCroppered, 80);

function init() {
  const imgEl = unref(imgRef);
  if (!imgEl) return;

  cropper.value = new Cropper(imgEl, {
    ...defaultOptions,
    ready: () => {
      isReady.value = true;
      realTimeCroppered();
      emit('ready', cropper.value!);
    },
    crop() {
      debounceRealTimeCroppered();
    },
    zoom() {
      debounceRealTimeCroppered();
    },
    cropmove() {
      debounceRealTimeCroppered();
    },
    ...props.options,
  });
}

// 实时显示预览
function realTimeCroppered() {
  props.realTimePreview && croppered();
}

// 事件：返回base64和裁剪后的宽高信息
function croppered() {
  if (!cropper.value) return;
  const imgInfo = cropper.value.getData();
  const canvas = props.circle
    ? getRoundedCanvas()
    : cropper.value.getCroppedCanvas();
  canvas.toBlob((blob) => {
    if (!blob) return;
    const fileReader: FileReader = new FileReader();
    fileReader.readAsDataURL(blob);
    fileReader.addEventListener('loadend', (e) => {
      emit('cropend', {
        imgBase64: (e.target?.result as string) ?? '',
        imgInfo,
      });
    });
    fileReader.addEventListener('error', () => {
      emit('cropendError');
    });
  }, 'image/png');
}

// 获取圆形图片画布
function getRoundedCanvas() {
  const sourceCanvas = cropper.value!.getCroppedCanvas();
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  canvas.width = width;
  canvas.height = height;
  context.imageSmoothingEnabled = true;
  context.drawImage(sourceCanvas, 0, 0, width, height);
  context.globalCompositeOperation = 'destination-in';
  context.beginPath();
  context.arc(
    width / 2,
    height / 2,
    Math.min(width, height) / 2,
    0,
    2 * Math.PI,
    true,
  );
  context.fill();
  return canvas;
}

onMounted(init);

onUnmounted(() => {
  cropper.value?.destroy();
});
</script>

<template>
  <div
    :class="{ 'cropper-image--circle': circle }"
    :style="{ height: `${`${height}`.replace(/px/, '')}px` }"
  >
    <img
      v-show="isReady"
      ref="image"
      :src
      :alt
      :crossorigin
      :style="getImageStyle"
    />
  </div>
</template>

<style lang="scss">
.cropper-image {
  &--circle {
    .cropper-view-box,
    .cropper-face {
      border-radius: 50%;
    }
  }
}
</style>
