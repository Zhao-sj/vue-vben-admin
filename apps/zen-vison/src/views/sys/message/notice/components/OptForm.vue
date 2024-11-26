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
      placeholder: $t('page.pleaseInput', [$t('sys.message.notice.title')]),
    },
    fieldName: 'title',
    formItemClass: 'col-span-2',
    label: $t('sys.message.notice.title'),
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
      placeholder: $t('page.pleaseSelect', [$t('sys.message.notice.type')]),
    },
    fieldName: 'type',
    label: $t('sys.message.notice.type'),
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
    label: $t('sys.message.notice.status'),
  },
  {
    component: 'Input',
    componentProps: {
      width: '100%',
      options: {
        auto_focus: false,
        menubar: false,
        placeholder: $t('page.pleaseInput', [$t('sys.message.notice.content')]),
      },
    },
    fieldName: 'content',
    formItemClass: 'col-span-2 flex-col items-start',
    label: $t('sys.message.notice.content'),
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
