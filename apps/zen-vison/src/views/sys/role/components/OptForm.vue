<script setup lang="ts">
import { useVbenForm, type VbenFormSchema } from '#/adapter';
import { $t } from '#/locales';

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [$t('zen.service.role.name')]),
    },
    fieldName: 'name',
    label: $t('zen.service.role.name'),
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [$t('zen.service.role.code')]),
    },
    fieldName: 'code',
    label: $t('zen.service.role.code'),
    rules: 'required',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: '!w-full',
      controlsPosition: 'right',
      min: 0,
      placeholder: $t('zen.common.pleaseInput', [$t('zen.service.role.sort')]),
    },
    fieldName: 'sort',
    label: $t('zen.service.role.sort'),
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      autosize: { maxRows: 5, minRows: 3 },
      placeholder: $t('zen.common.pleaseInput', [$t('zen.common.remark')]),
      resize: 'none',
      type: 'textarea',
    },
    fieldName: 'remark',
    label: $t('zen.common.remark'),
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
