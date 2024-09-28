<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
import { ElOption, ElSelect } from 'element-plus';

import { getTenantSimpleListApi } from '#/api';
import { useRequest } from '#/hooks';

const modelValue = defineModel<string>('modelValue');

const { data, loading, runAsync } = useRequest(getTenantSimpleListApi, {
  manual: true,
});

const remoteMethod = useDebounceFn(async (query: string) => {
  if (!query) {
    return;
  }

  await runAsync(query);
});

const handleBlur = () => {
  if (!modelValue.value) {
    return;
  }

  const ids = data.value?.map((item) => `${item.id}`) || [];
  if (!ids.includes(modelValue.value)) {
    modelValue.value = '';
  }
};
</script>

<template>
  <ElSelect
    v-model="modelValue"
    :loading
    :remote-method
    :reserve-keyword="false"
    filterable
    remote
    remote-show-suffix
    v-bind="$attrs"
    @blur="handleBlur"
    @clear="modelValue = ''"
  >
    <ElOption
      v-for="item in data || []"
      :key="item.id"
      :label="item.name"
      :value="`${item.id}`"
    />
  </ElSelect>
</template>
