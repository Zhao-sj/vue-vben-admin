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
    label: $t('zen.service.dept.parent'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [$t('zen.service.dept.name')]),
    },
    fieldName: 'name',
    label: $t('zen.service.dept.name'),
    rules: 'required',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: '!w-full',
      controlsPosition: 'right',
      min: 0,
      placeholder: $t('zen.common.pleaseInput', [$t('zen.service.dept.sort')]),
    },
    fieldName: 'sort',
    label: $t('zen.service.dept.sort'),
    rules: 'required',
  },
  {
    component: 'Select',
    componentProps: {
      options: props.userList.map((item) => ({
        label: item.nickname || item.id,
        value: item.id,
      })),
      placeholder: $t('zen.common.pleaseSelect', [
        $t('zen.service.dept.leader'),
      ]),
    },
    fieldName: 'leaderId',
    label: $t('zen.service.dept.leader'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [$t('zen.service.dept.phone')]),
    },
    fieldName: 'phone',
    label: $t('zen.service.dept.phone'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [$t('zen.service.dept.email')]),
    },
    fieldName: 'email',
    label: $t('zen.service.dept.email'),
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
    label: $t('zen.service.dept.status'),
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
