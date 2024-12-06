<script setup lang="ts">
import { IconPicker } from '@vben/common-ui';
import { listIcons } from '@vben/icons';

import { ElInput } from 'element-plus';

import iconData from './lucide';

interface Props {
  pageSize?: number;
  /**
   * 可以通过prefix获取系统中使用的图标集
   */
  prefix?: string;
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 36,
  prefix: '',
});

const modelValue = defineModel<string>();
const refIconPicker = ref<InstanceType<typeof IconPicker>>();

const currentList = computed(() => {
  try {
    if (!props.prefix) {
      const prefix = iconData.prefix;
      return iconData.icons.map((icon) => `${prefix}:${icon}`);
    }

    const icons = listIcons('', props.prefix);
    if (icons.length === 0) {
      console.warn(`No icons found for prefix: ${props.prefix}`);
    }
    return icons;
  } catch (error) {
    console.error('Failed to load icons:', error);
    return [];
  }
});

const triggerPopover = () => {
  refIconPicker.value?.toggleOpenState();
};

const handleChange = (icon: string) => {
  modelValue.value = icon;
};
</script>

<template>
  <ElInput v-model="modelValue" @click="triggerPopover">
    <template #append>
      <IconPicker
        ref="refIconPicker"
        :icons="currentList"
        :page-size
        :prefix
        :value="modelValue"
        @change="handleChange"
      />
    </template>
  </ElInput>
</template>

<style lang="scss" scoped>
:deep(.el-input-group__append) {
  padding: 0 8px;
}
</style>
