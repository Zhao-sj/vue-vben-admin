<script setup lang="ts">
import type { BaseSimple } from '#/api';

import { useVbenForm, type VbenFormSchema } from '#/adapter';
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
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.tenant.name'),
      ]),
    },
    fieldName: 'name',
    label: $t('zen.service.tenant.name'),
    rules: 'required',
  },
  {
    component: 'Select',
    componentProps: {
      options: props.packages.map((item) => ({
        label: item.name,
        value: item.id,
      })),
      placeholder: $t('zen.common.pleaseSelect', [
        $t('zen.service.tenant.package'),
      ]),
    },
    fieldName: 'packageId',
    label: $t('zen.service.tenant.package'),
    rules: 'selectRequired',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.tenant.contact'),
      ]),
    },
    fieldName: 'contactName',
    label: $t('zen.service.tenant.contact'),
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.tenant.contactPhone'),
      ]),
    },
    fieldName: 'contactMobile',
    label: $t('zen.service.tenant.contactPhone'),
    rules: 'required',
  },
  ...(props.edit
    ? []
    : [
        {
          component: 'Input',
          componentProps: {
            placeholder: $t('zen.common.pleaseInput', [
              $t('zen.service.tenant.username'),
            ]),
          },
          fieldName: 'username',
          label: $t('zen.service.tenant.username'),
          rules: 'required',
        },
        {
          component: 'Input',
          componentProps: {
            clearable: false,
            placeholder: $t('zen.common.pleaseInput', [
              $t('zen.service.tenant.password'),
            ]),
            showPassword: true,
            type: 'password',
          },
          fieldName: 'password',
          label: $t('zen.service.tenant.password'),
          rules: 'required',
        },
      ]),
  {
    component: 'InputNumber',
    componentProps: {
      class: '!w-full',
      controlsPosition: 'right',
      min: 1,
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.tenant.accountLimit'),
      ]),
    },
    fieldName: 'accountCount',
    label: $t('zen.service.tenant.accountLimit'),
    rules: 'required',
  },
  {
    component: 'DatePicker',
    componentProps: {
      class: '!w-full',
      placeholder: $t('zen.common.pleaseSelect', [
        $t('zen.service.tenant.expireTime'),
      ]),
      type: 'datetime',
    },
    fieldName: 'expireTime',
    label: $t('zen.service.tenant.expireTime'),
    rules: 'selectRequired',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.tenant.website'),
      ]),
    },
    fieldName: 'website',
    label: $t('zen.service.tenant.website'),
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
    label: $t('zen.service.tenant.status'),
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
