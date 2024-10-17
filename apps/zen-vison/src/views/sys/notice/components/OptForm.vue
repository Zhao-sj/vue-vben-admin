<script setup lang="ts">
import { useVbenForm, type VbenFormSchema } from '#/adapter/form';
import { Tinymce } from '#/components';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

const dictStore = useDictStore();

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.notice.title'),
      ]),
    },
    fieldName: 'title',
    formItemClass: 'col-span-2',
    label: $t('zen.service.notice.title'),
    rules: 'required',
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore
        .getDictDataList(DictTypeEnum.NOTICE_TYPE)
        .map((item) => ({
          ...item,
          value: +item.value,
        })),
      placeholder: $t('zen.common.pleaseSelect', [
        $t('zen.service.notice.type'),
      ]),
    },
    fieldName: 'type',
    label: $t('zen.service.notice.type'),
    rules: 'selectRequired',
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
    label: $t('zen.service.notice.status'),
  },
  {
    component: 'Input',
    componentProps: {
      options: {
        menubar: false,
        placeholder: $t('zen.common.pleaseInput', [
          $t('zen.service.notice.content'),
        ]),
      },
      width: '100%',
    },
    fieldName: 'content',
    formItemClass: 'col-span-2 flex-col items-start',
    label: $t('zen.service.notice.content'),
    labelClass: 'mb-2',
    rules: 'required',
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
    wrapperClass: 'grid-cols-1 lg:grid-cols-2 gap-x-4',
  }),
);

defineExpose({ formApi });
</script>

<template>
  <Form>
    <template #content="slotProps">
      <Tinymce v-bind="slotProps" />
    </template>
  </Form>
</template>
