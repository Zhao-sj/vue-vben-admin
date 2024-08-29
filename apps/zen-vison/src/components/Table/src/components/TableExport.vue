<script setup lang="ts">
import type { FormInstance } from 'element-plus';

import { useVbenModal } from '@vben/common-ui';

import { useDebounceFn } from '@vueuse/core';

interface Props {
  defaultName?: string;
}

interface Emits {
  (e: 'confirm', fullName: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formRef = ref<FormInstance>();
const loading = ref(false);

const state = ref({
  fileName: props.defaultName || '',
  fileType: 'xlsx',
});

const [Modal, modalApi] = useVbenModal({
  onCancel,
  onConfirm: useDebounceFn(onConfirm),
  onOpenChange,
});

function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    loading.value = false;
  }
}

function onCancel() {
  formRef.value?.resetFields();
  modalApi.close();
}

function onConfirm() {
  formRef.value?.validate((valid) => {
    if (valid) {
      const { fileName, fileType } = state.value;
      emit('confirm', `${fileName}.${fileType}`);
      loading.value = true;
    }
  });
}
</script>

<template>
  <Modal
    :cancel-text="$t('zen.common.cancel')"
    :confirm-loading="loading"
    :confirm-text="$t('zen.common.confirm')"
    :title="$t('zen.export.title')"
    class="w-11/12 md:w-1/2 lg:w-1/3 xl:w-1/4 2xl:w-1/5"
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
  </Modal>
</template>
