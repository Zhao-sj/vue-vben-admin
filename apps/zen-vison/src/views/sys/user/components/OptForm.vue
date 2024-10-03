<script setup lang="ts">
import { useVbenForm, type VbenFormSchema } from '#/adapter';
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
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.user.nickname'),
      ]),
    },
    fieldName: 'nickname',
    label: $t('zen.service.user.nickname'),
    rules: 'required',
  },
  {
    component: 'TreeSelect',
    componentProps: {
      checkStrictly: true,
      data: buildMenuTree(props.deptList),
      nodeKey: 'id',
      placeholder: $t('zen.common.pleaseSelect', [
        $t('zen.service.user.deptName'),
      ]),
      props: {
        label: 'name',
        children: 'children',
      },
    },
    fieldName: 'deptId',
    label: $t('zen.service.user.deptName'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.user.mobile'),
      ]),
    },
    fieldName: 'mobile',
    label: $t('zen.service.user.mobile'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [$t('zen.service.user.email')]),
    },
    fieldName: 'email',
    label: $t('zen.service.user.email'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.user.username'),
      ]),
    },
    fieldName: 'username',
    label: $t('zen.service.user.username'),
    rules: 'required',
  },
  ...(props.edit
    ? []
    : [
        {
          component: 'Input',
          componentProps: {
            placeholder: $t('zen.common.pleaseInput', [
              $t('zen.service.user.password'),
            ]),
            showPassword: true,
            type: 'password',
          },
          fieldName: 'password',
          label: $t('zen.service.user.password'),
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
      placeholder: $t('zen.common.pleaseSelect', [$t('zen.service.user.sex')]),
    },
    fieldName: 'sex',
    label: $t('zen.service.user.sex'),
  },
  {
    component: 'Select',
    componentProps: {
      multiple: true,
      options: props.postList.map((item) => ({
        label: item.name,
        value: item.id,
      })),
      placeholder: $t('zen.common.pleaseSelect', [$t('zen.service.user.post')]),
    },
    fieldName: 'postIds',
    label: $t('zen.service.user.post'),
  },
  {
    component: 'Input',
    componentProps: {
      autosize: { maxRows: 5, minRows: 3 },
      placeholder: $t('zen.common.pleaseInput', [$t('zen.common.remark')]),
      resize: 'none',
      type: 'textarea',
    },
    fieldName: 'remark',
    formItemClass: 'lg:col-span-2',
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
