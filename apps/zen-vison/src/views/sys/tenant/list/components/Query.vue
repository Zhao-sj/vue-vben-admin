<script setup lang="ts">
import type { TenantApi } from '#/api';

import { useIsMobile } from '@vben/hooks';

import { useVbenForm, type VbenFormSchema } from '#/adapter/form';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { translateState, useResetVbenVxeForm } from '#/utils';

interface Emits {
  (e: 'query', data: TenantApi.PageQuery): void;
}

const emit = defineEmits<Emits>();

const dictStore = useDictStore();
const { isMobile } = useIsMobile();

const queryWrapperRef = useTemplateRef<HTMLDivElement>('queryWrapperRef');
useResetVbenVxeForm(queryWrapperRef);

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.tenant.list.name')]),
    },
    fieldName: 'name',
    label: $t('sys.tenant.list.name'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.STATUS),
      placeholder: $t('page.pleaseSelect', [$t('sys.tenant.list.status')]),
    },
    fieldName: 'status',
    label: $t('sys.tenant.list.status'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.tenant.list.contact')]),
    },
    fieldName: 'contactName',
    label: $t('sys.tenant.list.contact'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.tenant.list.contactPhone')]),
    },
    fieldName: 'contactMobile',
    formItemClass: 'lg:pb-0',
    label: $t('sys.tenant.list.contactPhone'),
  },
  {
    component: 'DatePicker',
    componentProps: {
      class: '!w-full 2xl:!w-80',
      endPlaceholder: $t('page.endDate'),
      startPlaceholder: $t('page.startDate'),
      type: 'daterange',
    },
    fieldName: 'createTime',
    formItemClass: 'lg:pb-0',
    label: $t('page.createTime'),
  },
]);

const [QueryForm, formApi] = useVbenForm(
  reactive({
    actionWrapperClass: 'col-span-1 lg:text-left 2xl:pl-20 lg:pb-0',
    collapsed: true,
    commonConfig: {
      componentProps: {
        clearable: true,
      },
      formItemClass: 'lg:pr-4 2xl:pb-0',
      labelWidth: 65,
    },
    handleSubmit: onSubmit,
    handleReset: onReset,
    schema: formSchema,
    showCollapseButton: isMobile,
    submitButtonOptions: {
      content: computed(() => $t('page.query')),
    },
    wrapperClass: 'grid-cols-1 lg:grid-cols-3 2xl:grid-cols-6',
  }),
);

function onSubmit(values: TenantApi.PageQuery) {
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
