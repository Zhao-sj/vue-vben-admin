<script setup lang="ts">
import type { Nullable } from '@vben/types';

import { VxeGrid, type VxeGridInstance } from 'vxe-table';

defineOptions({ name: 'VxeBasicTable' });
defineExpose({ getTableInstance });

const containerRef = ref<Nullable<HTMLDivElement>>(null);
const cardRef = ref<Nullable<HTMLDivElement>>(null);
const vxeTableRef = ref<Nullable<VxeGridInstance>>(null);

const containerHeight = ref<string>('auto');
const tableMaxHeight = ref<number | string>('auto');

function getComputedStyle<T extends Element>(element: T) {
  return window.getComputedStyle(element);
}

function getTableInstance<T>() {
  return vxeTableRef.value as Nullable<VxeGridInstance<T>>;
}

function fixedHeight() {
  if (!containerRef.value || !cardRef.value) {
    return;
  }

  const containerStyle = getComputedStyle(containerRef.value);
  const cardStyle = getComputedStyle(cardRef.value);
  const space =
    Number.parseFloat(containerStyle.paddingTop) +
    Number.parseFloat(containerStyle.paddingBottom) +
    Number.parseFloat(cardStyle.paddingTop) +
    Number.parseFloat(cardStyle.paddingBottom);

  const { top } = containerRef.value!.getBoundingClientRect();
  const height = document.documentElement.clientHeight - top;

  containerHeight.value = `${height}px`;
  tableMaxHeight.value = height - space;
}

onMounted(fixedHeight);
</script>

<template>
  <div ref="containerRef" :style="{ height: containerHeight }" class="p-5">
    <div ref="cardRef" class="card-box p-2">
      <VxeGrid
        ref="vxeTableRef"
        v-bind="$attrs"
        :max-height="tableMaxHeight"
        :min-height="500"
      >
        <template
          v-for="item in Object.keys($slots)"
          :key="item"
          #[item]="slotData"
        >
          <slot :name="item" v-bind="slotData ?? {}"></slot>
        </template>
      </VxeGrid>
    </div>
  </div>
</template>
