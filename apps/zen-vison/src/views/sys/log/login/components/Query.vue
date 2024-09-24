<script setup lang="ts">
import type { LogApi } from '#/api';

import { useIsMobile } from '@vben/hooks';

import { useVbenForm, type VbenFormSchema } from '#/adapter';
import { $t } from '#/locales';
import { translateState } from '#/utils';

interface Emits {
  (e: 'query', data: LogApi.LoginQuery): void;
}

const emit = defineEmits<Emits>();

const { isMobile } = useIsMobile();

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.log.common.ip'),
      ]),
    },
    fieldName: 'ip',
    label: $t('zen.service.log.common.ip'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.log.login.username'),
      ]),
    },
    fieldName: 'username',
    label: $t('zen.service.log.login.username'),
  },
  {
    component: 'Select',
    componentProps: {
      options: [
        { label: $t('zen.service.log.login.success'), value: true },
        { label: $t('zen.service.log.login.fail'), value: false },
      ],
      placeholder: $t('zen.common.pleaseSelect', [
        $t('zen.service.log.login.result'),
      ]),
    },
    fieldName: 'status',
    label: $t('zen.service.log.login.result'),
  },
  {
    component: 'DatePicker',
    componentProps: {
      class: '!w-full 2xl:!w-80',
      endPlaceholder: $t('zen.common.endDate'),
      startPlaceholder: $t('zen.common.startDate'),
      type: 'daterange',
    },
    fieldName: 'createTime',
    formItemClass: 'lg:pb-0',
    label: $t('zen.service.log.login.createTime'),
  },
]);

const [QueryForm] = useVbenForm(
  reactive({
    actionWrapperClass: 'col-span-1 lg:text-left 2xl:pl-20',
    collapsed: true,
    commonConfig: {
      componentProps: {
        clearable: true,
      },
      formItemClass: 'lg:pr-4 2xl:pb-0',
      labelWidth: 65,
    },
    handleSubmit: onSubmit,
    schema: formSchema,
    showCollapseButton: isMobile,
    submitButtonOptions: {
      text: computed(() => $t('zen.common.query')),
    },
    wrapperClass: 'grid-cols-1 lg:grid-cols-3 2xl:grid-cols-6',
  }),
);

function onSubmit(values: LogApi.LoginQuery) {
  const { state } = translateState(values);
  emit('query', state);
}
</script>

<template>
  <div class="rounded-lg border p-3">
    <QueryForm />
  </div>
</template>
