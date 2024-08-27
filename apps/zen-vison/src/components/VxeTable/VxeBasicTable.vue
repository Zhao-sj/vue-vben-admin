<script setup lang="ts">
import type { Nullable } from '@vben/types';

import { VxeGrid, type VxeGridInstance } from 'vxe-table';

import { FullHeightContainer } from '#/components';

defineOptions({ name: 'VxeBasicTable' });
defineExpose({ getTableInstance });

const vxeTableRef = ref<Nullable<VxeGridInstance>>(null);
const tableMaxHeight = ref<number | string>('auto');

function getTableInstance<T>() {
  return vxeTableRef.value as Nullable<VxeGridInstance<T>>;
}
</script>

<template>
  <FullHeightContainer @resize="tableMaxHeight = $event">
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
  </FullHeightContainer>
</template>
