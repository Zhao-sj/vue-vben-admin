<script setup lang="ts">
import { useVbenForm, type VbenFormSchema } from '#/adapter/form';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

interface Props {
  edit?: boolean;
}

const props = defineProps<Props>();

const dictStore = useDictStore();

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [$t('zen.service.dict.name')]),
    },
    fieldName: 'name',
    label: $t('zen.service.dict.name'),
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      disabled: props.edit,
      placeholder: $t('zen.common.pleaseInput', [$t('zen.service.dict.type')]),
    },
    fieldName: 'type',
    label: $t('zen.service.dict.type'),
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
  <Form />
</template>
