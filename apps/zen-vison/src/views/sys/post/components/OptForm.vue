<script setup lang="ts">
import { useVbenForm, type VbenFormSchema } from '#/adapter/form';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

const dictStore = useDictStore();

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('sys.post.name'),
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'code',
    label: $t('sys.post.code'),
    rules: 'required',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: '!w-full',
      controlsPosition: 'right',
      min: 0,
    },
    fieldName: 'sort',
    label: $t('sys.post.sort'),
    rules: 'required',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.STATUS).map((item) => ({
        ...item,
        value: +item.value,
      })),
      optionType: 'button',
    },
    defaultValue: 0,
    fieldName: 'status',
    label: $t('sys.post.status'),
  },
  {
    component: 'Input',
    componentProps: {
      autosize: { maxRows: 5, minRows: 3 },
      resize: 'none',
      type: 'textarea',
    },
    fieldName: 'remark',
    label: $t('page.remark'),
    labelClass: 'self-start h-8',
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

defineExpose({ formApi });
</script>

<template>
  <Form />
</template>
