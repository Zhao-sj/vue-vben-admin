<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { useDebounceFn } from '@vueuse/core';

import { useVbenForm, type VbenFormSchema } from '#/adapter/form';
import { $t } from '#/locales';

interface Props {
  defaultName?: string;
}

interface Emits {
  (e: 'confirm', fullName: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const loading = ref(false);

const [Modal] = useVbenModal({
  onConfirm: useDebounceFn(onConfirm),
  onOpenChange,
});

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    componentProps: {
      clearable: true,
      placeholder: $t('zen.common.pleaseInput', [$t('zen.export.fileName')]),
    },
    defaultValue: props.defaultName,
    fieldName: 'fileName',
    label: $t('zen.export.fileName'),
    rules: 'required',
  },
  {
    component: 'Select',
    componentProps: {
      options: [
        { label: 'xlsx', value: 'xlsx' },
        { label: 'xls', value: 'xls' },
      ],
    },
    defaultValue: 'xlsx',
    fieldName: 'fileType',
    label: $t('zen.export.fileType'),
  },
]);

const [Form, formApi] = useVbenForm(
  reactive({
    commonConfig: {
      labelClass: 'mr-4',
      labelWidth: 65,
    },
    schema: formSchema,
    showDefaultActions: false,
    wrapperClass: 'grid-cols-1',
  }),
);

function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    loading.value = false;
  }
}

async function onConfirm() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return;
  }

  const { fileName, fileType } = await formApi.getValues();
  emit('confirm', `${fileName}.${fileType}`);
  loading.value = true;
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :title="$t('zen.export.title')"
    class="w-11/12 md:w-1/2 lg:w-1/3 xl:w-1/4 2xl:w-1/5"
    draggable
  >
    <Form />
  </Modal>
</template>
