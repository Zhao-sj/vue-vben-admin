<script setup lang="ts">
import type { FormInstance } from 'element-plus';

import { useDebounceFn } from '@vueuse/core';

interface Props {
  defaultName?: string;
}

interface Emits {
  (e: 'confirm', fullName: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const modelValue = defineModel<boolean>('modelValue');
const formRef = ref<FormInstance>();

const state = ref({
  fileName: props.defaultName || '',
  fileType: 'xlsx',
});

const handleConfirm = useDebounceFn(() => {
  formRef.value?.validate((valid) => {
    if (valid) {
      const { fileName, fileType } = state.value;
      modelValue.value = false;
      emit('confirm', `${fileName}.${fileType}`);
    }
  });
});
</script>

<template>
  <ElDialog
    v-model="modelValue"
    :close-on-click-modal="false"
    :title="$t('zen.export.title')"
    class="!w-11/12 md:!w-1/2 lg:!w-1/3 xl:!w-1/4 2xl:!w-1/5"
    draggable
    width="auto"
    v-bind="$attrs"
    @close="formRef?.resetFields"
  >
    <ElForm ref="formRef" :label-width="80" :model="state">
      <ElFormItem
        :label="$t('zen.export.fileName')"
        :rules="{
          required: true,
          message: $t('zen.export.fileNameMsg'),
          trigger: 'blur',
        }"
        prop="fileName"
        required
      >
        <ElInput
          v-model="state.fileName"
          :placeholder="$t('zen.common.pleaseInput')"
          clearable
        />
      </ElFormItem>

      <ElFormItem :label="$t('zen.export.fileType')" class="!mb-0">
        <ElSelect v-model="state.fileType">
          <ElOption label="xlsx" value="xlsx" />
          <ElOption label="xls" value="xls" />
        </ElSelect>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="modelValue = false">
        {{ $t('zen.common.cancel') }}
      </ElButton>
      <ElButton type="primary" @click="handleConfirm">
        {{ $t('zen.common.confirm') }}
      </ElButton>
    </template>
  </ElDialog>
</template>
