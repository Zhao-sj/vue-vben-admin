<script setup lang="ts">
import { Icon } from '@vben/icons';

interface Props {
  label: string;
  content?: string;
}

defineProps<Props>();
</script>

<template>
  <ElFormItem v-bind="$attrs">
    <template #label>
      <div class="flex items-center gap-1">
        <span>{{ label }}</span>
        <ElTooltip
          :content
          :disabled="!content"
          :show-after="500"
          popper-class="max-w-60"
        >
          <Icon class="cursor-help outline-none" icon="lucide:circle-help" />
        </ElTooltip>
      </div>
    </template>

    <template
      v-for="item in Object.keys($slots)"
      :key="item"
      #[item]="slotData"
    >
      <slot :name="item" v-bind="slotData ?? {}"></slot>
    </template>
  </ElFormItem>
</template>
