<script setup lang="ts">
import type { UserApi } from '#/api';

import { useIsMobile } from '@vben/hooks';

import { useVbenForm, type VbenFormSchema } from '#/adapter';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { translateState } from '#/utils';

interface Emits {
  (e: 'query', data: UserApi.PageQuery): void;
}

const emit = defineEmits<Emits>();

const dictStore = useDictStore();
const { isMobile } = useIsMobile();

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.user.username'),
      ]),
    },
    fieldName: 'username',
    label: $t('zen.service.user.username'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.user.mobile'),
      ]),
    },
    fieldName: 'mobile',
    label: $t('zen.service.user.mobile'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.STATUS),
      placeholder: $t('zen.common.pleaseSelect', [
        $t('zen.service.user.status'),
      ]),
    },
    fieldName: 'status',
    label: $t('zen.service.user.status'),
  },
  {
    component: 'DatePicker',
    componentProps: {
      class: '!w-full lg:!w-80',
      endPlaceholder: $t('zen.common.endDate'),
      startPlaceholder: $t('zen.common.startDate'),
      type: 'daterange',
    },
    fieldName: 'createTime',
    formItemClass: 'lg:pb-0',
    label: $t('zen.common.createTime'),
  },
]);

const [QueryForm] = useVbenForm(
  reactive({
    actionWrapperClass: 'col-span-1 lg:text-left pl-20',
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
    wrapperClass: 'grid-cols-1 lg:grid-cols-3 2xl:grid-cols-5',
  }),
);

function onSubmit(values: UserApi.PageQuery) {
  const { state } = translateState(values);
  emit('query', state);
}
</script>

<template>
  <div class="rounded-lg border p-3">
    <QueryForm />
  </div>
</template>
