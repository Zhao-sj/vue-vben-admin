<script setup lang="ts">
import { useVbenForm, type VbenFormSchema } from '#/adapter/form';
import { type BaseSimple, buildMenuTree, type DeptApi } from '#/api';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

interface Props {
  deptList?: DeptApi.Simple[];
  postList?: BaseSimple[];
  edit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  deptList: () => [],
  postList: () => [],
});

const dictStore = useDictStore();

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.user.nickname')]),
    },
    fieldName: 'nickname',
    label: $t('sys.user.nickname'),
    rules: 'required',
  },
  {
    component: 'TreeSelect',
    componentProps: {
      checkStrictly: true,
      data: buildMenuTree(props.deptList),
      nodeKey: 'id',
      placeholder: $t('page.pleaseSelect', [$t('sys.user.deptName')]),
      props: {
        label: 'name',
        children: 'children',
      },
    },
    fieldName: 'deptId',
    label: $t('sys.user.deptName'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.user.mobile')]),
    },
    fieldName: 'mobile',
    label: $t('sys.user.mobile'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.user.email')]),
    },
    fieldName: 'email',
    label: $t('sys.user.email'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.user.username')]),
    },
    fieldName: 'username',
    label: $t('sys.user.username'),
    rules: 'required',
  },
  ...(props.edit
    ? []
    : [
        {
          component: 'Input',
          componentProps: {
            placeholder: $t('page.pleaseInput', [$t('sys.user.password')]),
            showPassword: true,
            type: 'password',
          },
          fieldName: 'password',
          label: $t('sys.user.password'),
          rules: 'required',
        },
      ]),
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.SEX).map((item) => ({
        label: item.label,
        value: +item.value,
      })),
      placeholder: $t('page.pleaseSelect', [$t('sys.user.sex')]),
    },
    fieldName: 'sex',
    label: $t('sys.user.sex'),
  },
  {
    component: 'Select',
    componentProps: {
      multiple: true,
      options: props.postList.map((item) => ({
        label: item.name,
        value: item.id,
      })),
      placeholder: $t('page.pleaseSelect', [$t('sys.user.post')]),
    },
    fieldName: 'postIds',
    label: $t('sys.user.post'),
  },
  {
    component: 'Input',
    componentProps: {
      autosize: { maxRows: 5, minRows: 3 },
      placeholder: $t('page.pleaseInput', [$t('page.remark')]),
      resize: 'none',
      type: 'textarea',
    },
    fieldName: 'remark',
    formItemClass: 'lg:col-span-2',
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
      labelWidth: 80,
    },
    schema: formSchema,
    showDefaultActions: false,
    wrapperClass: 'grid-cols-1 lg:grid-cols-2 gap-x-4',
  }),
);

defineExpose({
  formApi,
});
</script>

<template>
  <Form />
</template>
