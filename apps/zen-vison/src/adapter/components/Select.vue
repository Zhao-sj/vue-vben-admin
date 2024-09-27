<script setup lang="ts">
import { ElOption, ElSelect } from 'element-plus';

type Options = InstanceType<typeof ElOption>['$props'];

interface Props {
  options?: Options[];
}

defineProps<Props>();
</script>

<template>
  <ElSelect v-bind="$attrs">
    <template
      v-for="item in Object.keys($slots)"
      :key="item"
      #[item]="slotData"
    >
      <slot :name="item" v-bind="slotData ?? {}"></slot>
    </template>

    <ElOption v-for="item in options" :key="`${item.value}`" v-bind="item" />
  </ElSelect>
</template>
