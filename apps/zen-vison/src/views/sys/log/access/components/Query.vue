<script setup lang="ts">
import type { LogApi } from '#/api';

import { useIsMobile } from '@vben/hooks';

import { useVbenForm, type VbenFormSchema } from '#/adapter';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { translateState, useResetVbenVxeForm } from '#/utils';

interface Emits {
  (e: 'query', data: LogApi.AccessQuery): void;
}

const emit = defineEmits<Emits>();

const dictStore = useDictStore();
const { isMobile } = useIsMobile();

const queryWrapperRef = useTemplateRef<HTMLDivElement>('queryWrapperRef');
useResetVbenVxeForm(queryWrapperRef);

const formSchema = computed<VbenFormSchema[]>(() => [
  // {
  //   component: 'Input',
  //   componentProps: {
  //     placeholder: $t('zen.common.pleaseInput', [
  //       $t('zen.service.log.common.appName'),
  //     ]),
  //   },
  //   fieldName: 'appName',
  //   label: $t('zen.service.log.common.appName'),
  // },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.log.common.userId'),
      ]),
    },
    fieldName: 'userId',
    label: $t('zen.service.log.common.userId'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.USER_TYPE),
      placeholder: $t('zen.common.pleaseSelect', [
        $t('zen.service.log.common.userType'),
      ]),
    },
    fieldName: 'userType',
    label: $t('zen.service.log.common.userType'),
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: '!w-full',
      controlsPosition: 'right',
      min: 1,
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.log.access.duration'),
      ]),
    },
    fieldName: 'duration',
    label: $t('zen.service.log.access.duration'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.log.common.requestUrl'),
      ]),
    },
    fieldName: 'requestUrl',
    label: $t('zen.service.log.common.requestUrl'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.log.access.resultCode'),
      ]),
    },
    fieldName: 'resultCode',
    formItemClass: 'lg:pb-0 2xl:pb-6',
    label: $t('zen.service.log.access.resultCode'),
  },
  {
    component: 'DatePicker',
    componentProps: {
      class: '!w-full lg:!w-80',
      endPlaceholder: $t('zen.common.endDate'),
      startPlaceholder: $t('zen.common.startDate'),
      type: 'daterange',
    },
    fieldName: 'beginTime',
    formItemClass: 'lg:pb-0',
    label: $t('zen.service.log.access.createTime'),
  },
]);

const [QueryForm, formApi] = useVbenForm(
  reactive({
    actionWrapperClass: 'col-span-1 lg:text-left lg:pl-20 lg:pb-0',
    collapsed: true,
    commonConfig: {
      componentProps: {
        clearable: true,
      },
      formItemClass: 'lg:pr-4',
      labelWidth: 65,
    },
    handleSubmit: onSubmit,
    handleReset: onReset,
    schema: formSchema,
    showCollapseButton: isMobile,
    submitButtonOptions: {
      content: computed(() => $t('zen.common.query')),
    },
    wrapperClass: 'grid-cols-1 lg:grid-cols-4 2xl:grid-cols-5',
  }),
);

function onSubmit(values: LogApi.AccessQuery) {
  const { state } = translateState({ createTime: values.beginTime });
  values.beginTime = state.createTime;
  emit('query', values);
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
