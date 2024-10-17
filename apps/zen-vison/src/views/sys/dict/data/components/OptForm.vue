<script setup lang="ts">
import { useVbenForm, type VbenFormSchema } from '#/adapter/form';
import { type DictApi } from '#/api';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

interface Props {
  type?: string;
}

defineProps<Props>();

const dictStore = useDictStore();

const colorOpts: DictApi.Color[] = [
  'primary',
  'success',
  'info',
  'warning',
  'danger',
];

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    fieldName: 'type',
    label: $t('zen.service.dict.type'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [$t('zen.service.dict.label')]),
    },
    fieldName: 'label',
    label: $t('zen.service.dict.label'),
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [$t('zen.service.dict.value')]),
    },
    fieldName: 'value',
    label: $t('zen.service.dict.value'),
    rules: 'required',
  },
  {
    component: 'Select',
    componentProps: {
      options: colorOpts.map((item) => ({
        label: item,
        value: item,
      })),
      placeholder: $t('zen.common.pleaseInput', [$t('zen.service.dict.color')]),
    },
    fieldName: 'color',
    label: $t('zen.service.dict.color'),
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: '!w-full',
      controlsPosition: 'right',
      min: 0,
      placeholder: $t('zen.common.pleaseInput', [$t('zen.service.dict.sort')]),
    },
    fieldName: 'sort',
    label: $t('zen.service.dict.sort'),
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
    label: $t('zen.service.dict.status'),
  },
  {
    component: 'Input',
    componentProps: {
      autosize: {
        maxRows: 5,
        minRows: 3,
      },
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
  <Form>
    <template #type>
      <ElInput :model-value="type" disabled />
    </template>
  </Form>
</template>
