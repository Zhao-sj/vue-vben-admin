<script setup lang="ts">
import {
  SliderCaptcha,
  type SliderRotateVerifyPassingData,
} from '@vben/common-ui';

import { type AuthApi } from '#/api';
import { $t } from '#/locales';

interface Props {
  data?: AuthApi.CaptchaResp;
  validate: (pointJsonStr: string) => Promise<boolean>;
}

interface Emits {
  (e: 'refresh'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const basemapRef = useTemplateRef<HTMLImageElement>('basemapRef');
const puzzleRef = useTemplateRef<HTMLImageElement>('puzzleRef');
const sliderBarRef =
  useTemplateRef<InstanceType<typeof SliderCaptcha>>('sliderBarRef');

const state = reactive({
  dragging: false,
  endTime: 0,
  imgSize: {
    height: 155,
    width: 310,
  },
  isPassing: false,
  moveX: 0,
  puzzleSize: 0,
  showTip: false,
  startTime: 0,
});

const basemapStyles = computed(() => ({
  height: `${state.imgSize.height}px`,
  width: `${state.imgSize.width}px`,
}));

const verifyTip = computed(() =>
  state.isPassing
    ? $t('page.captcha.blockPuzzleSuccessTip', [
        ((state.endTime - state.startTime) / 1000).toFixed(1),
      ])
    : $t('page.captcha.fail'),
);

function handleDragStart() {
  state.startTime = Date.now();
  state.dragging = true;
}

function handleDragBarMove(data: SliderRotateVerifyPassingData) {
  if (data.moveX >= 0 && data.moveX <= state.imgSize.width - state.puzzleSize) {
    state.moveX = data.moveX;
  }
}

async function handleDragEnd() {
  state.endTime = Date.now();
  const pointJsonStr = JSON.stringify({ x: state.moveX, y: 5 });
  state.isPassing = true;
  const isPassing = await props.validate(pointJsonStr);
  setTimeout(() => {
    state.isPassing = isPassing;
    state.showTip = true;

    if (!isPassing) {
      setTimeout(() => {
        handleRefresh();
      }, 1200);
    }
  }, 0);
}

function handleBasemapOnLoad() {
  state.imgSize.width = basemapRef.value!.offsetWidth;
  state.imgSize.height = basemapRef.value!.offsetHeight;
}

function handlePuzzleOnLoad() {
  state.puzzleSize = puzzleRef.value!.offsetWidth;
}

function handleRefresh() {
  if (state.isPassing) {
    return;
  }

  emit('refresh');
  state.moveX = 0;
  state.showTip = false;
  state.dragging = false;
  sliderBarRef.value?.resume();
}
</script>

<template>
  <div>
    <div class="relative overflow-hidden rounded-md">
      <div :style="basemapStyles" class="relative" @click="handleRefresh">
        <img
          v-if="data?.basemap"
          ref="basemapRef"
          :src="data.basemap"
          :style="basemapStyles"
          alt="basemap"
          @load="handleBasemapOnLoad"
        />

        <img
          v-if="data?.slider"
          ref="puzzleRef"
          :src="data?.slider"
          :style="`transform: translateX(${state.moveX}px)`"
          alt="puzzle"
          class="absolute left-0 top-0"
          @load="handlePuzzleOnLoad"
        />
      </div>

      <div
        class="absolute bottom-0 left-0 z-10 block h-7 w-full text-center text-xs leading-[30px] text-white"
      >
        <div
          v-if="state.showTip"
          :class="{
            'bg-success/80': state.isPassing,
            'bg-destructive/80': !state.isPassing,
          }"
        >
          {{ verifyTip }}
        </div>
        <div v-if="!state.dragging" class="bg-black/30">
          {{ $t('page.captcha.blockPuzzleDefaultTip') }}
        </div>
      </div>
    </div>

    <SliderCaptcha
      ref="sliderBarRef"
      :model-value="state.isPassing"
      class="mt-2"
      is-slot
      @end="handleDragEnd"
      @move="handleDragBarMove"
      @start="handleDragStart"
    >
      <template v-for="(_, key) in $slots" :key="key" #[key]="slotProps">
        <slot :name="key" v-bind="slotProps"></slot>
      </template>
    </SliderCaptcha>
  </div>
</template>
