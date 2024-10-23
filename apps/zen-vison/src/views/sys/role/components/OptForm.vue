<script setup lang="ts">
import { useVbenForm, type VbenFormSchema } from '#/adapter/form';
import { $t } from '#/locales';

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.role.name')]),
    },
    fieldName: 'name',
    label: $t('sys.role.name'),
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.role.code')]),
    },
    fieldName: 'code',
    label: $t('sys.role.code'),
    rules: 'required',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: '!w-full',
      controlsPosition: 'right',
      min: 0,
      placeholder: $t('page.pleaseInput', [$t('sys.role.sort')]),
    },
    fieldName: 'sort',
    label: $t('sys.role.sort'),
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      autosize: { maxRows: 5, minRows: 3 },
      placeholder: $t('page.pleaseInput', [$t('page.remark')]),
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
