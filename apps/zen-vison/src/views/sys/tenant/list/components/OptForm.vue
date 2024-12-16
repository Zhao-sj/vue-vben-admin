<script setup lang="ts">
import type { BaseSimple } from '#/api';

import { useVbenForm, type VbenFormSchema } from '#/adapter/form';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

interface Props {
  packages?: BaseSimple[];
  edit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  packages: () => [],
});

const dictStore = useDictStore();

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('sys.tenant.list.name'),
    rules: 'required',
  },
  {
    component: 'Select',
    componentProps: {
      options: props.packages.map((item) => ({
        label: item.name,
        value: item.id,
      })),
    },
    fieldName: 'packageId',
    label: $t('sys.tenant.list.package'),
    rules: 'selectRequired',
  },
  {
    component: 'Input',
    fieldName: 'contactName',
    label: $t('sys.tenant.list.contact'),
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'contactMobile',
    label: $t('sys.tenant.list.contactPhone'),
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'username',
    label: $t('sys.tenant.list.username'),
    rules: 'required',
    dependencies: {
      if: () => !props.edit,
      triggerFields: ['username'],
    },
  },
  {
    component: 'Input',
    componentProps: {
      clearable: false,
      showPassword: true,
      type: 'password',
    },
    fieldName: 'password',
    label: $t('sys.tenant.list.password'),
    rules: 'required',
    dependencies: {
      if: () => !props.edit,
      triggerFields: ['password'],
    },
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: '!w-full',
      controlsPosition: 'right',
      min: 1,
    },
    fieldName: 'accountCount',
    label: $t('sys.tenant.list.accountLimit'),
    rules: 'required',
  },
  {
    component: 'DatePicker',
    componentProps: {
      format: 'yyyy/MM/dd HH:mm:ss',
      enableSeconds: true,
      enableTimePicker: true,
    },
    fieldName: 'expireTime',
    label: $t('sys.tenant.list.expireTime'),
    rules: 'selectRequired',
  },
  {
    component: 'Input',
    fieldName: 'website',
    label: $t('sys.tenant.list.website'),
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
    label: $t('sys.tenant.list.status'),
  },
]);

const [Form, formApi] = useVbenForm(
  reactive({
    commonConfig: {
      componentProps: {
        clearable: true,
      },
      labelClass: 'mr-4',
      labelWidth: 80,
    },
    schema: formSchema,
    showDefaultActions: false,
    wrapperClass: 'grid-cols-1 lg:grid-cols-2 gap-x-4',
  }),
);

defineExpose({ formApi });
</script>

<template>
  <Form />
</template>
