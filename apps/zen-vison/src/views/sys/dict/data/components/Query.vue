<script setup lang="ts">
import { useIsMobile } from '@vben/hooks';

import { useVbenForm, type VbenFormSchema } from '#/adapter/form';
import { type DictApi, getDictTypeSimpleListApi } from '#/api';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { useResetVbenVxeForm } from '#/utils';

interface Emits {
  (e: 'query', data: DictApi.DataPageQuery): void;
}

const emit = defineEmits<Emits>();

const { currentRoute } = useRouter();
const dictStore = useDictStore();
const { isMobile } = useIsMobile();

const queryWrapperRef = useTemplateRef<HTMLDivElement>('queryWrapperRef');
useResetVbenVxeForm(queryWrapperRef);

const { data: dictTypeList, loading } = useRequest(getDictTypeSimpleListApi);

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Select',
    componentProps: {
      clearable: false,
      loading,
      options: dictTypeList.value?.map((item) => ({
        label: item.name,
        value: item.id,
      })),
      placeholder: $t('page.pleaseSelect', [$t('sys.dict.type.title')]),
    },
    defaultValue: +currentRoute.value.params.id!,
    fieldName: 'dictTypeId',
    label: $t('sys.dict.type.title'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.dict.data.label')]),
    },
    fieldName: 'label',
    label: $t('sys.dict.data.label'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.STATUS),
      placeholder: $t('page.pleaseSelect', [$t('sys.dict.status')]),
    },
    fieldName: 'status',
    label: $t('sys.dict.status'),
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
      content: computed(() => $t('page.query')),
    },
    wrapperClass: 'grid-cols-1 lg:grid-cols-4 2xl:grid-cols-6',
  }),
);

function onSubmit(values: Record<string, any>) {
  emit('query', values as DictApi.DataPageQuery);
}

function onReset() {
  formApi.resetForm();
  emit('query', { dictTypeId: +currentRoute.value.params.id! });
}
</script>

<template>
  <div ref="queryWrapperRef" class="rounded-lg border p-3">
    <QueryForm />
  </div>
</template>
