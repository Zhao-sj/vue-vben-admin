<script setup lang="ts">
import { ElOption } from 'element-plus';
import { isArray } from 'lodash-es';

const modelValue = defineModel<string | string[]>('modelValue');
const createList = ref<string[]>(
  isArray(modelValue.value) ? modelValue.value : [],
);

const attrs = useAttrs();

watch(createList, (list) => {
  modelValue.value = list;
});

watch(
  modelValue,
  (modelValue) => {
    if (isArray(modelValue)) {
      createList.value = modelValue;
    }
  },
  { once: true },
);
</script>

<template>
  <div class="w-full">
    <ElSelect
      v-model="createList"
      :reserve-keyword="false"
      allow-create
      clearable
      filterable
      multiple
      v-bind="attrs"
    >
      <ElOption
        v-for="item in createList"
        :key="item"
        :label="item"
        :value="item"
      />
    </ElSelect>
  </div>
</template>
