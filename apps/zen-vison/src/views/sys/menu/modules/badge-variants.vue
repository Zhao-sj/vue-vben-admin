<script setup lang="ts">
const modelValue = defineModel<string>('modelValue');

const colorList = [
  { value: 'default' },
  { value: 'destructive' },
  { value: 'primary' },
  { value: 'success' },
  { value: 'danger' },
  { value: 'warning' },
];

function querySearch(qs: string, cb: any) {
  const result = colorList.filter((item) =>
    item.value.toLowerCase().includes(qs.trim().toLowerCase()),
  );

  cb(result);
}
</script>

<template>
  <div class="flex items-center gap-1">
    <ElAutocomplete
      v-model="modelValue"
      :fetch-suggestions="querySearch"
      :teleported="false"
      v-bind="$attrs"
    />

    <ElColorPicker v-model="modelValue" />
  </div>
</template>
