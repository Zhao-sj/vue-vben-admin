<script setup lang="ts">
import { useNamespace } from '@vben/hooks';
import { Icon } from '@vben/icons';
import { Nullable } from '@vben/types';

import { useDraggable } from '@vueuse/core';

import { type AuthApi } from '#/api';

interface Props {
  baseOffsetLeft: number;
  data: Nullable<AuthApi.CaptchaResp>;
  isSuccess: boolean;
  showFeedback: boolean;
}

interface Emits {
  (e: 'refresh'): void;
  (e: 'load'): void;
  (e: 'validate', data: string): void;
}

defineOptions({ name: 'BlockPuzzle' });
const props = withDefaults(defineProps<Props>(), {
  baseOffsetLeft: 0,
});
const emit = defineEmits<Emits>();
const ns = useNamespace('block-puzzle');

let sliderContainerWidth = 0;
const sliderRef = ref<Nullable<HTMLDivElement>>(null);
const slideContainerRef = ref<Nullable<HTMLDivElement>>(null);
const slideBlockRef = ref<Nullable<HTMLDivElement>>(null);
const slideX = ref(0);
const isLoaded = ref(false);
const isDragged = ref(false);
const sliderBlockSize = ref(47);

useDraggable(sliderRef, {
  axis: 'x',
  onEnd: () => {
    emit('validate', JSON.stringify({ x: slideX.value, y: 5 }));
  },
  onMove: ({ x }) => {
    const left = props.baseOffsetLeft;
    const right = left + sliderContainerWidth - sliderRef.value!.offsetWidth;
    if (x < left || x > right) {
      return;
    }
    slideX.value = x - props.baseOffsetLeft;
  },
  onStart: () => {
    isDragged.value = true;
  },
  pointerTypes: ['mouse', 'touch', 'pen'],
});

function handleRefresh() {
  emit('refresh');
  isDragged.value = false;
  slideX.value = 0;
}

function handleBaseMapLoaded() {
  emit('load');
  isLoaded.value = true;
}

function handleSlideLoaded() {
  sliderBlockSize.value = slideBlockRef.value!.offsetWidth;
  nextTick(() => {
    sliderContainerWidth = slideContainerRef.value!.offsetWidth;
  });
}

watch(
  () => props.showFeedback,
  (showFeedback) => {
    if (!showFeedback) {
      slideX.value = 0;
    }
  },
);
</script>

<template>
  <div :class="[ns.b()]" class="relative flex flex-col gap-1">
    <div :class="[{ 'default-size': !isLoaded }]" class="relative flex">
      <div
        class="absolute right-0 top-0 z-10 flex h-8 w-8 cursor-pointer items-center justify-center"
        @click="handleRefresh()"
      >
        <Icon class="text-2xl text-white" icon="material-symbols:refresh" />
      </div>

      <ElImage
        v-if="data"
        :src="data.basemap"
        class="select-none"
        @load="handleBaseMapLoaded"
      />

      <div
        ref="slideBlockRef"
        :style="`transform: translateX(${slideX}px)`"
        class="absolute left-0 top-0 z-10 flex"
      >
        <ElImage
          v-if="data && data.slider"
          :src="data.slider"
          class="select-none"
          @load="handleSlideLoaded"
        />
      </div>
    </div>

    <div ref="slideContainerRef" class="relative border">
      <div
        class="z-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-lg"
      >
        向右滑动完成验证
      </div>

      <div :style="`width:${slideX}px;`" class="z-2 relative bg-green-600">
        <div
          ref="sliderRef"
          :style="{
            transform: `translateX(${slideX}px)`,
            width: `${sliderBlockSize}px`,
            height: `${sliderBlockSize}px`,
          }"
          class="flex cursor-move items-center justify-center bg-gray-300 dark:bg-slate-800"
        >
          <Icon
            :class="[{ 'bounce-right': !isDragged }]"
            class="text-3xl"
            icon="ri:arrow-right-double-line"
          />
        </div>
      </div>
    </div>

    <div
      v-if="showFeedback"
      class="absolute left-0 top-0 z-20 flex h-full w-full items-center justify-center bg-slate-100 bg-opacity-75"
    >
      <div class="flex flex-col items-center gap-1">
        <Icon
          :class="[isSuccess ? 'text-green-600' : 'text-red-500']"
          :icon="`ep:circle-${isSuccess ? 'check' : 'close'}-filled`"
          class="text-2xl"
        />
        <span class="text-xs">验证{{ isSuccess ? '成功' : '失败' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@vben/styles/global';

@include b('block-puzzle') {
  .default-size {
    width: 310px;
    height: 155px;
  }

  .bounce-right {
    animation: bounce 1s ease-in-out infinite;
  }
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateX(0);
  }

  40% {
    transform: translateX(10%);
  }

  60% {
    transform: translateX(5%);
  }
}
</style>
