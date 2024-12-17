<script setup lang="ts">
import { useVbenForm, type VbenFormSchema } from '#/adapter/form';
import { type BaseSimple, buildMenuTree, type CategoryApi } from '#/api';
import { Tinymce } from '#/components';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

interface Props {
  categoryList?: CategoryApi.Simple[];
  tagList?: BaseSimple[];
}

const props = withDefaults(defineProps<Props>(), {
  categoryList: () => [],
  tagList: () => [],
});

const dictStore = useDictStore();

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'ImageUpload',
    fieldName: 'banner',
    label: $t('cms.article.banner'),
    formItemClass: 'col-span-3 lg:col-span-1 lg:row-span-2',
    rules: 'selectRequired',
  },
  {
    component: 'Cascader',
    componentProps: {
      options: buildMenuTree(props.categoryList),
      class: 'w-full',
      props: {
        label: 'name',
        value: 'id',
        expandTrigger: 'hover',
      },
    },
    fieldName: 'categoryId',
    label: $t('cms.article.category'),
    formItemClass: 'col-span-3 lg:col-span-1',
    rules: 'selectRequired',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      options: dictStore
        .getDictDataList(DictTypeEnum.ARTICLE_STATUS)
        .map((item) => ({
          ...item,
          value: +item.value,
        })),
      optionType: 'button',
    },
    defaultValue: 10,
    fieldName: 'status',
    label: $t('cms.article.status'),
    formItemClass: 'col-span-3 lg:col-span-1',
  },
  {
    component: 'Select',
    componentProps: {
      multiple: true,
      multipleLimit: 5,
      options: props.tagList.map((item) => ({
        label: item.name,
        value: item.id,
      })),
    },
    fieldName: 'tagIds',
    formItemClass: 'col-span-3 lg:col-span-2',
    label: $t('cms.article.tag'),
  },
  {
    component: 'Input',
    fieldName: 'title',
    formItemClass: 'col-span-3',
    label: $t('cms.article.title'),
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      autosize: {
        maxRows: 5,
        minRows: 3,
      },
      showWordLimit: true,
      maxlength: 200,
      resize: 'none',
      type: 'textarea',
    },
    fieldName: 'description',
    formItemClass: 'col-span-3',
    label: $t('cms.article.description'),
    labelClass: 'self-start h-8',
  },
  {
    component: 'Input',
    componentProps: {
      width: '100%',
      options: {
        auto_focus: false,
        placeholder: $t('page.pleaseInput'),
      },
    },
    fieldName: 'content',
    formItemClass: 'col-span-3 flex-col items-start',
    label: $t('cms.article.content'),
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
      labelWidth: 40,
    },
    schema: formSchema,
    showDefaultActions: false,
    wrapperClass: 'grid-cols-1 lg:grid-cols-3 gap-x-4',
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
