<script setup lang="ts">
import { useNamespace } from '@vben/hooks';
import { Icon } from '@vben/icons';
import { Nullable } from '@vben/types';

import { useDebounceFn } from '@vueuse/core';

import { type AuthApi } from '#/api';

interface Props {
  data: Nullable<AuthApi.CaptchaResp>;
  isSuccess: boolean;
  showFeedback: boolean;
}

interface Emits {
  (e: 'refresh'): void;
  (e: 'validate', data: string): void;
}

defineOptions({ name: 'ClickWord' });
const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const ns = useNamespace('click-word');

const isLoaded = ref(false);
const pointList = ref<Array<{ x: number; y: number }>>([]);

const handleBaseMapClick = useDebounceFn((e: MouseEvent) => {
  if (!props.data || pointList.value.length >= props.data.wordList!.length) {
    return;
  }
  const pointJson = { x: e.offsetX, y: e.offsetY };
  pointList.value.push(pointJson);

  if (pointList.value.length === props.data.wordList!.length) {
    emit('validate', JSON.stringify(pointList.value));
  }
});

function handleRefresh(e: MouseEvent) {
  e.stopPropagation();
  pointList.value = [];
  emit('refresh');
}

function handleBaseMapLoaded() {
  isLoaded.value = true;
}

watch(
  () => props.showFeedback,
  (showFeedback) => {
    if (!showFeedback) {
      pointList.value = [];
    }
  },
);
</script>

<template>
  <div :class="[ns.b()]" class="relative flex flex-col gap-1">
    <div
      :class="[{ 'default-size': !isLoaded }]"
      class="relative flex"
      @click="handleBaseMapClick"
    >
      <div
        class="absolute right-0 top-0 z-10 flex h-8 w-8 cursor-pointer items-center justify-center"
        @click="handleRefresh"
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
        v-for="(item, i) in pointList"
        :key="i"
        :style="{ left: `${item.x}px`, top: `${item.y}px` }"
        class="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 select-none items-center justify-center rounded-full bg-green-500 text-white"
      >
        {{ i + 1 }}
      </div>
    </div>

    <div
      v-if="data && data.wordList"
      class="flex h-12 select-none items-center justify-center"
    >
      <span class="text-lg">
        请依次点击【{{ data.wordList.map((item) => item).join('，') }}】
      </span>
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

@include b('click-word') {
  .default-size {
    width: 310px;
    height: 155px;
  }
}
</style>
