<script setup lang="ts">
import { useVbenForm, type VbenFormSchema } from '#/adapter/form';
import { buildMenuTree, type DeptApi, type UserApi } from '#/api';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

interface Props {
  deptList?: DeptApi.Simple[];
  userList?: UserApi.Simple[];
}

const props = withDefaults(defineProps<Props>(), {
  deptList: () => [],
  userList: () => [],
});

const dictStore = useDictStore();

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'TreeSelect',
    componentProps: {
      checkStrictly: true,
      data: buildMenuTree(props.deptList),
      expandOnClickNode: false,
      nodeKey: 'id',
      props: {
        label: 'name',
        children: 'children',
      },
    },
    fieldName: 'parentId',
    formItemClass: 'col-span-2',
    label: $t('sys.dept.parent'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.dept.name')]),
    },
    fieldName: 'name',
    label: $t('sys.dept.name'),
    rules: 'required',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: '!w-full',
      controlsPosition: 'right',
      min: 0,
      placeholder: $t('page.pleaseInput', [$t('sys.dept.sort')]),
    },
    fieldName: 'sort',
    label: $t('sys.dept.sort'),
    rules: 'required',
  },
  {
    component: 'Select',
    componentProps: {
      options: props.userList.map((item) => ({
        label: item.nickname || item.id,
        value: item.id,
      })),
      placeholder: $t('page.pleaseSelect', [$t('sys.dept.leader')]),
    },
    fieldName: 'leaderId',
    label: $t('sys.dept.leader'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.dept.phone')]),
    },
    fieldName: 'phone',
    label: $t('sys.dept.phone'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.dept.email')]),
    },
    fieldName: 'email',
    label: $t('sys.dept.email'),
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
    label: $t('sys.dept.status'),
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
