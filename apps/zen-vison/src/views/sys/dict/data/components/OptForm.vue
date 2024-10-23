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
    label: $t('sys.dict.type.title'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.dict.data.label')]),
    },
    fieldName: 'label',
    label: $t('sys.dict.data.label'),
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.dict.data.value')]),
    },
    fieldName: 'value',
    label: $t('sys.dict.data.value'),
    rules: 'required',
  },
  {
    component: 'Select',
    componentProps: {
      options: colorOpts.map((item) => ({
        label: item,
        value: item,
      })),
      placeholder: $t('page.pleaseInput', [$t('sys.dict.data.color')]),
    },
    fieldName: 'color',
    label: $t('sys.dict.data.color'),
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: '!w-full',
      controlsPosition: 'right',
      min: 0,
      placeholder: $t('page.pleaseInput', [$t('sys.dict.data.sort')]),
    },
    fieldName: 'sort',
    label: $t('sys.dict.data.sort'),
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
    label: $t('sys.dict.status'),
  },
  {
    component: 'Input',
    componentProps: {
      autosize: {
        maxRows: 5,
        minRows: 3,
      },
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
  <Form>
    <template #type>
      <ElInput :model-value="type" disabled />
    </template>
  </Form>
</template>
