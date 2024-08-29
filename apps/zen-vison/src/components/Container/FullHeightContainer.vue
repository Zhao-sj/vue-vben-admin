<script setup lang="ts">
import { useNamespace } from '@vben/hooks';

import { useThrottleFn } from '@vueuse/core';

interface Props {
  card?: boolean;
}

interface Emits {
  (e: 'resize', height: number): void;
}

defineOptions({ name: 'FullHeightContainer' });

withDefaults(defineProps<Props>(), {
  card: true,
});
const emit = defineEmits<Emits>();

const ns = useNamespace('full-height-container');

const containerRef = ref<HTMLDivElement>();
const cardRef = ref<HTMLDivElement>();

const containerHeight = ref<string>('auto');

function getComputedStyle<T extends Element>(element: T) {
  return window.getComputedStyle(element);
}

const fixedHeight = useThrottleFn(() => {
  if (!containerRef.value) {
    return;
  }

  const containerStyle = getComputedStyle(containerRef.value);

  let space =
    Number.parseFloat(containerStyle.paddingTop) +
    Number.parseFloat(containerStyle.paddingBottom);

  if (cardRef.value) {
    const cardStyle = getComputedStyle(cardRef.value);
    space +=
      Number.parseFloat(cardStyle.borderTopWidth) +
      Number.parseFloat(cardStyle.borderBottomWidth) +
      Number.parseFloat(cardStyle.paddingTop) +
      Number.parseFloat(cardStyle.paddingBottom);
  }

  const { top } = containerRef.value!.getBoundingClientRect();
  const height = document.documentElement.clientHeight - top;
  const contentMaxHeight = height - space;

  containerHeight.value = `${height}px`;
  emit('resize', contentMaxHeight);
});

defineExpose({ fixedHeight });

onMounted(() => {
  fixedHeight();
  window.addEventListener('resize', fixedHeight);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', fixedHeight);
});
</script>

<template>
  <div
    ref="containerRef"
    :class="[ns.b()]"
    :style="{ height: containerHeight }"
    class="p-5"
  >
    <div v-if="card" ref="cardRef" class="card-box p-5">
      <slot></slot>
    </div>

    <slot v-else></slot>
  </div>
</template>
