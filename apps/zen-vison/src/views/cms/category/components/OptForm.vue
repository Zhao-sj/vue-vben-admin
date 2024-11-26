<script setup lang="ts">
import { useVbenForm, type VbenFormSchema } from '#/adapter/form';
import { buildMenuTree, type CategoryApi } from '#/api';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

interface Props {
  categoryList?: CategoryApi.Simple[];
}

const props = withDefaults(defineProps<Props>(), {
  categoryList: () => [],
});

const dictStore = useDictStore();

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'TreeSelect',
    componentProps: {
      checkStrictly: true,
      data: buildMenuTree(props.categoryList),
      expandOnClickNode: false,
      nodeKey: 'id',
      props: {
        label: 'name',
        children: 'children',
      },
    },
    fieldName: 'parentId',
    label: $t('cms.category.parent'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('cms.category.name')]),
    },
    fieldName: 'name',
    label: $t('cms.category.name'),
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('cms.category.code')]),
    },
    fieldName: 'code',
    label: $t('cms.category.code'),
    rules: 'required',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: '!w-full',
      controlsPosition: 'right',
      min: 0,
      placeholder: $t('page.pleaseInput', [$t('cms.category.sort')]),
    },
    fieldName: 'sort',
    label: $t('cms.category.sort'),
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
    label: $t('cms.category.status'),
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
    wrapperClass: 'grid-cols-1',
  }),
);

defineExpose({ formApi });
</script>

<template>
  <Form />
</template>
