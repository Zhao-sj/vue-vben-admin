<script setup lang="ts">
import type { InputInstance } from 'element-plus';

import type { VbenFormSchema } from '#/adapter/form';

import { useVbenModal } from '@vben/common-ui';

import { useDebounceFn } from '@vueuse/core';

import { useVbenForm } from '#/adapter/form';
import { getAreaApi } from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

const { loading, runAsync } = useRequest(getAreaApi, { manual: true });

const schema: VbenFormSchema[] = [
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
      placeholder: '',
    },
    fieldName: 'location',
    label: $t('sys.area.address'),
  },
];

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      clearable: true,
    },
    labelClass: 'mr-4',
    labelWidth: 65,
  },
  schema,
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

const [Modal] = useVbenModal({
  onOpenChange(isOpen) {
    if (isOpen) {
      setTimeout(() => {
        const el = formApi.getFieldComponentRef<InputInstance>('ip');
        el?.focus();
      }, 0);
    }
  },
  onConfirm: useDebounceFn(onConfirm),
});

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
    footer-class="gap-x-0"
    draggable
  >
    <Form />
  </Modal>
</template>
