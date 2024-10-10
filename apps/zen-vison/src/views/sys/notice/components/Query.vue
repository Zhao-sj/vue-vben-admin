<script setup lang="ts">
import { useIsMobile } from '@vben/hooks';

import { useVbenForm, type VbenFormSchema } from '#/adapter';
import { type NoticeApi } from '#/api';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { useResetVbenVxeForm } from '#/utils';

interface Emits {
  (e: 'query', data: NoticeApi.PageQuery): void;
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
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.notice.title'),
      ]),
    },
    fieldName: 'title',
    label: $t('zen.service.notice.title'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.STATUS),
      placeholder: $t('zen.common.pleaseSelect', [
        $t('zen.service.notice.status'),
      ]),
    },
    fieldName: 'status',
    label: $t('zen.service.notice.status'),
  },
]);

const [QueryForm, formApi] = useVbenForm(
  reactive({
    actionWrapperClass: 'col-span-1 lg:text-left lg:pb-0',
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
      content: computed(() => $t('zen.common.query')),
    },
    wrapperClass: 'grid-cols-1 lg:grid-cols-4 2xl:grid-cols-6',
  }),
);

function onSubmit(values: NoticeApi.PageQuery) {
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
