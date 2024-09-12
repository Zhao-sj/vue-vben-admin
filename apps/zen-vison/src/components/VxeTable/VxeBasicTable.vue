<script setup lang="ts">
import type { Nullable } from '@vben/types';

import { useNamespace } from '@vben/hooks';

import { VxeGrid, type VxeGridInstance } from 'vxe-table';

import { FullHeightContainer } from '#/components';

defineOptions({ name: 'VxeBasicTable' });
defineExpose({ getTableInstance });

const ns = useNamespace('vxe-basic-table');

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
      :class="[ns.b(), $slots.form ? ns.m('has-form') : '']"
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

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-vxe-basic-table;

:deep(.#{$prefix-cls}:not(.#{$prefix-cls}--has-form)) {
  .vxe-toolbar {
    padding-top: 0;
  }
}
</style>
