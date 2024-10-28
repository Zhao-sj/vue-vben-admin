<script setup lang="ts">
import type { FileApi } from '#/api';

import { useIsMobile } from '@vben/hooks';

import { useVbenForm, type VbenFormSchema } from '#/adapter/form';
import { $t } from '#/locales';
import { translateState, useResetVbenVxeForm } from '#/utils';

interface Emits {
  (e: 'query', data: FileApi.PageQuery): void;
}

const emit = defineEmits<Emits>();

const { isMobile } = useIsMobile();

const queryWrapperRef = useTemplateRef<HTMLDivElement>('queryWrapperRef');
useResetVbenVxeForm(queryWrapperRef);

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('infra.file.list.path')]),
    },
    fieldName: 'path',
    label: $t('infra.file.list.path'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('infra.file.list.type')]),
    },
    fieldName: 'type',
    label: $t('infra.file.list.type'),
  },
  {
    component: 'DatePicker',
    componentProps: {
      class: '!w-full lg:!w-80',
      endPlaceholder: $t('page.endDate'),
      startPlaceholder: $t('page.startDate'),
      type: 'daterange',
    },
    fieldName: 'createTime',
    label: $t('page.createTime'),
  },
]);

const [QueryForm, formApi] = useVbenForm(
  reactive({
    actionWrapperClass: 'col-span-1 lg:text-left pl-20 lg:pb-0',
    collapsed: true,
    commonConfig: {
      componentProps: {
        clearable: true,
      },
      formItemClass: 'lg:pr-4 lg:pb-0',
      labelWidth: 65,
    },
    handleSubmit: onSubmit,
    handleReset: onReset,
    schema: formSchema,
    showCollapseButton: isMobile,
    submitButtonOptions: {
      content: computed(() => $t('page.query')),
    },
    wrapperClass: 'grid-cols-1 lg:grid-cols-4 2xl:grid-cols-6',
  }),
);

function onSubmit(values: FileApi.PageQuery) {
  const { state } = translateState(values);
  emit('query', state);
}

function onReset() {
  formApi.resetForm();
  emit('query', {});
}
</script>

<template>
  <div ref="queryWrapperRef" class="rounded-lg border p-3">
    <QueryForm />
  </div>
</template>
