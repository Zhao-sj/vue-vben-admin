<script setup lang="ts">
import type { AuthApi } from '#/api';

import { VbenButton } from '@vben/common-ui';
import { IconifyIcon, RotateCw } from '@vben/icons';

import { useCaptchaPoints } from './helper';

interface Props {
  data?: AuthApi.CaptchaResp;
  validate: (pointJsonStr: string) => Promise<boolean>;
}

interface Emits {
  (e: 'refresh'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const POINT_OFFSET = 11;
const basemapRef = useTemplateRef('basemapRef');
const { addPoint, clearPoints, points } = useCaptchaPoints();

const state = reactive({
  imgSize: {
    height: 155,
    width: 310,
  },
  isPassing: false,
  showTip: false,
});

const basemapStyles = computed(() => ({
  height: `${state.imgSize.height}px`,
  width: `${state.imgSize.width}px`,
}));

function getElementPosition(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
  };
}

function handleBasemapOnLoad() {
  state.imgSize.width = basemapRef.value!.offsetWidth;
  state.imgSize.height = basemapRef.value!.offsetHeight;
}

function handleClick(e: MouseEvent) {
  if (points.length >= props.data!.wordList!.length) {
    return;
  }

  try {
    const dom = e.currentTarget as HTMLElement;
    if (!dom) throw new Error('Element not found');

    const { x: domX, y: domY } = getElementPosition(dom);

    const mouseX = e.clientX + window.scrollX;
    const mouseY = e.clientY + window.scrollY;

    if (typeof mouseX !== 'number' || typeof mouseY !== 'number') {
      throw new TypeError('Mouse coordinates not found');
    }

    const xPos = mouseX - domX;
    const yPos = mouseY - domY;

    const rect = dom.getBoundingClientRect();

    // 点击位置边界校验
    if (xPos < 0 || yPos < 0 || xPos > rect.width || yPos > rect.height) {
      console.warn('Click position is out of the valid range');
      return;
    }

    const x = Math.ceil(xPos);
    const y = Math.ceil(yPos);

    const point = {
      i: points.length,
      t: Date.now(),
      x,
      y,
    };

    addPoint(point);
  } catch (error) {
    console.error('Error in handleClick:', error);
  }
}

function clear() {
  try {
    clearPoints();
  } catch (error) {
    console.error('Error in clear:', error);
  }
}

function handleRefresh() {
  try {
    clear();
    state.showTip = false;
    state.isPassing = false;
    emit('refresh');
  } catch (error) {
    console.error('Error in handleRefresh:', error);
  }
}

async function handleConfirm() {
  const pointList = points.map((point) => ({ x: point.x, y: point.y }));
  const isPassing = await props.validate(JSON.stringify(pointList));
  state.isPassing = isPassing;
  state.showTip = true;

  if (!isPassing) {
    setTimeout(() => {
      handleRefresh();
    }, 1200);
  }
}
</script>

<template>
  <div class="relative">
    <div :style="basemapStyles" class="relative overflow-hidden rounded-md">
      <img
        ref="basemapRef"
        :src="data?.basemap"
        :style="basemapStyles"
        alt="basemap"
        class="relative z-10"
        @click.stop.prevent="handleClick"
        @load="handleBasemapOnLoad"
      />

      <div class="absolute inset-0">
        <div
          v-for="(point, index) in points"
          :key="index"
          :aria-label="$t('page.captcha.pointAriaLabel') + (index + 1)"
          :style="{
            top: `${point.y - POINT_OFFSET}px`,
            left: `${point.x - POINT_OFFSET}px`,
          }"
          :tabindex="index"
          class="bg-primary text-primary-50 border-primary-50 absolute z-20 flex h-5 w-5 cursor-default items-center justify-center rounded-full border-2"
          role="button"
        >
          {{ index + 1 }}
        </div>
      </div>
    </div>

    <div class="mt-2 flex items-end justify-between">
      <div>
        <VbenButton
          :aria-label="$t('page.captcha.refreshAriaLabel')"
          class="rounded-full"
          size="icon"
          variant="icon"
          @click="handleRefresh"
        >
          <RotateCw class="size-5" />
        </VbenButton>
      </div>

      <div>
        <VbenButton
          :aria-label="$t('page.captcha.confirmAriaLabel')"
          :disabled="points.length === 0"
          size="sm"
          @click="handleConfirm"
        >
          {{ $t('page.captcha.confirm') }}
        </VbenButton>
      </div>
    </div>

    <div
      v-if="state.showTip"
      class="absolute inset-0 z-30 flex flex-col items-center justify-center gap-1 rounded-md bg-white/80 dark:bg-black/80"
    >
      <IconifyIcon
        :class="[state.isPassing ? 'text-green-600' : 'text-red-500']"
        :icon="`ep:circle-${state.isPassing ? 'check' : 'close'}-filled`"
        class="text-2xl"
      />

      <span class="text-xs">
        {{
          state.isPassing ? $t('page.captcha.pass') : $t('page.captcha.fail')
        }}
      </span>
    </div>
  </div>
</template>
