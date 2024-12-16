<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { useDebounceFn } from '@vueuse/core';

import { useVbenForm, type VbenFormSchema } from '#/adapter/form';
import { getAreaApi } from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

const { loading, runAsync } = useRequest(getAreaApi, { manual: true });

const [Modal] = useVbenModal({
  onConfirm: useDebounceFn(onConfirm),
});

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    fieldName: 'ip',
    label: $t('sys.area.ip'),
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      disabled: true,
      placeholder: ' ',
    },
    fieldName: 'location',
    label: $t('sys.area.address'),
  },
]);

const [Form, formApi] = useVbenForm(
  reactive({
    commonConfig: {
      componentProps: {
        clearable: true,
      },
      labelClass: 'mr-4',
      labelWidth: 65,
    },
    schema: formSchema,
    showDefaultActions: false,
    wrapperClass: 'grid-cols-1',
  }),
);

async function onConfirm() {
  const { valid } = await formApi.validate();
  if (!valid) return;

  const { ip } = await formApi.getValues();
  const location = await runAsync(ip);
  formApi.setFieldValue('location', location);
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :confirm-text="$t('page.query')"
    :title="$t('sys.area.search')"
    class="w-11/12 lg:w-1/3 2xl:w-1/4"
    draggable
    footer-class="gap-x-0"
  >
    <Form />
  </Modal>
</template>
