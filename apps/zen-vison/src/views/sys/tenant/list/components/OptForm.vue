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
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.tenant.list.name')]),
    },
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
      placeholder: $t('page.pleaseSelect', [$t('sys.tenant.list.package')]),
    },
    fieldName: 'packageId',
    label: $t('sys.tenant.list.package'),
    rules: 'selectRequired',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.tenant.list.contact')]),
    },
    fieldName: 'contactName',
    label: $t('sys.tenant.list.contact'),
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.tenant.list.contactPhone')]),
    },
    fieldName: 'contactMobile',
    label: $t('sys.tenant.list.contactPhone'),
    rules: 'required',
  },
  ...(props.edit
    ? []
    : [
        {
          component: 'Input',
          componentProps: {
            placeholder: $t('page.pleaseInput', [
              $t('sys.tenant.list.username'),
            ]),
          },
          fieldName: 'username',
          label: $t('sys.tenant.list.username'),
          rules: 'required',
        },
        {
          component: 'Input',
          componentProps: {
            clearable: false,
            placeholder: $t('page.pleaseInput', [
              $t('sys.tenant.list.password'),
            ]),
            showPassword: true,
            type: 'password',
          },
          fieldName: 'password',
          label: $t('sys.tenant.list.password'),
          rules: 'required',
        },
      ]),
  {
    component: 'InputNumber',
    componentProps: {
      class: '!w-full',
      controlsPosition: 'right',
      min: 1,
      placeholder: $t('page.pleaseInput', [$t('sys.tenant.list.accountLimit')]),
    },
    fieldName: 'accountCount',
    label: $t('sys.tenant.list.accountLimit'),
    rules: 'required',
  },
  {
    component: 'DatePicker',
    componentProps: {
      class: '!w-full',
      placeholder: $t('page.pleaseSelect', [$t('sys.tenant.list.expireTime')]),
      type: 'datetime',
    },
    fieldName: 'expireTime',
    label: $t('sys.tenant.list.expireTime'),
    rules: 'selectRequired',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.tenant.list.website')]),
    },
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
