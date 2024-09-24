<script setup lang="ts">
import type { DeptApi, MenuApi } from '#/api';

import { useIsMobile } from '@vben/hooks';

import { useVbenForm, type VbenFormSchema } from '#/adapter';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

interface Props {
  visible?: boolean;
}

interface Emits {
  (e: 'query', data: MenuApi.Query): void;
}

withDefaults(defineProps<Props>(), { visible: true });
const emit = defineEmits<Emits>();

const dictStore = useDictStore();
const { isMobile } = useIsMobile();

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [$t('zen.service.dept.name')]),
    },
    fieldName: 'name',
    label: $t('zen.service.dept.name'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.STATUS),
      placeholder: $t('zen.common.pleaseSelect', [
        $t('zen.service.dept.status'),
      ]),
    },
    fieldName: 'status',
    label: $t('zen.service.dept.status'),
  },
]);

const [QueryForm] = useVbenForm(
  reactive({
    actionWrapperClass: 'col-span-1 lg:text-left',
    collapsed: true,
    commonConfig: {
      componentProps: {
        clearable: true,
      },
      formItemClass: 'lg:pr-4 lg:pb-0',
      labelWidth: 65,
    },
    handleSubmit: onSubmit,
    schema: formSchema,
    showCollapseButton: isMobile,
    submitButtonOptions: {
      text: computed(() => $t('zen.common.query')),
    },
    wrapperClass: 'grid-cols-1 lg:grid-cols-4 2xl:grid-cols-6',
  }),
);

function onSubmit(values: DeptApi.Query) {
  emit('query', values);
}
</script>

<template>
  <div class="rounded-lg border p-3">
    <QueryForm />
  </div>
</template>
