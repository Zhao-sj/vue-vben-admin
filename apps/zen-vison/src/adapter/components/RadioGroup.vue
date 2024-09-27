<script setup lang="ts">
import { ElRadio, ElRadioButton, ElRadioGroup } from 'element-plus';

type Options =
  | InstanceType<typeof ElRadio>['$props']
  | InstanceType<typeof ElRadioButton>['$props'];

interface Props {
  options?: Options[];
  optionType: 'button' | 'default';
}

defineProps<Props>();
</script>

<template>
  <ElRadioGroup v-bind="$attrs">
    <component
      :is="optionType === 'button' ? ElRadioButton : ElRadio"
      v-for="item in options"
      :key="`${item.value}`"
      v-bind="item"
    />
  </ElRadioGroup>
</template>
