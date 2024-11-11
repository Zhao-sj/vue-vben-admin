<script setup lang="ts">
import { cloneDeep, omit } from 'lodash-es';

import { useVbenForm, type VbenFormSchema } from '#/adapter/form';
import { buildMenuTree, type MenuApi } from '#/api';
import { DictTypeEnum, MENU_ROOT, MenuType } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

import MetaForm from './MetaForm.vue';

interface Props {
  menus?: MenuApi.Simple[];
}

const props = withDefaults(defineProps<Props>(), {
  menus: () => [],
});

const dictStore = useDictStore();

const metaFormRef =
  useTemplateRef<InstanceType<typeof MetaForm>>('metaFormRef');
const type = ref(MenuType.MENU);

const componentList = [{ value: 'BasicLayout' }];
const menuTypeOpts = [
  { label: $t('sys.menu.dir'), value: MenuType.DIR },
  { label: $t('sys.menu.menu'), value: MenuType.MENU },
  { label: $t('sys.menu.button'), value: MenuType.BUTTON },
];

const menuTree = computed(() => {
  const menuList = props.menus.filter((item) => item.type !== MenuType.BUTTON);
  menuList.push({
    id: MENU_ROOT,
    name: $t('sys.menu.root'),
    parentId: -1,
    type: MenuType.DIR,
  });
  return buildMenuTree(menuList);
});

function querySearch(qs: string, cb: any) {
  const result = componentList.filter((item) =>
    item.value.toLowerCase().includes(qs.trim().toLowerCase()),
  );

  cb(result);
}

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'RadioGroup',
    componentProps: {
      options: menuTypeOpts,
      optionType: 'button',
    },
    defaultValue: MenuType.MENU,
    dependencies: {
      trigger(values) {
        type.value = values.type;
      },
      triggerFields: ['type'],
    },
    fieldName: 'type',
    formItemClass: 'lg:col-span-2',
    label: $t('sys.menu.type'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.menu.name')]),
    },
    fieldName: 'name',
    label: $t('sys.menu.name'),
    rules: 'required',
  },
  {
    component: 'TreeSelect',
    componentProps: {
      checkStrictly: true,
      data: menuTree,
      expandOnClickNode: false,
      nodeKey: 'id',
      placeholder: $t('page.pleaseSelect', [$t('sys.menu.parent')]),
      props: {
        label: 'name',
        children: 'children',
      },
    },
    fieldName: 'parentId',
    label: $t('sys.menu.parent'),
    rules: 'selectRequired',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: '!w-full',
      controlsPosition: 'right',
      min: 0,
      placeholder: $t('page.pleaseInput', [$t('sys.menu.sort')]),
    },
    fieldName: 'sort',
    label: $t('sys.menu.sort'),
    rules: 'required',
  },
  {
    component: 'IconPicker',
    componentProps: {
      placeholder: $t('page.pleaseSelect', [$t('sys.menu.icon')]),
    },
    dependencies: {
      if(values) {
        return values.type !== MenuType.BUTTON;
      },
      triggerFields: ['type'],
    },
    fieldName: 'icon',
    help: $t('sys.menu.tip.icon'),
    label: $t('sys.menu.icon'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.menu.path')]),
    },
    dependencies: {
      if(values) {
        return values.type !== MenuType.BUTTON;
      },
      triggerFields: ['type'],
    },
    fieldName: 'path',
    help: $t('sys.menu.tip.path'),
    label: $t('sys.menu.path'),
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.menu.componentName')]),
    },
    dependencies: {
      if(values) {
        return values.type !== MenuType.BUTTON;
      },
      triggerFields: ['type'],
    },
    fieldName: 'componentName',
    help: $t('sys.menu.tip.componentName'),
    label: $t('sys.menu.componentName'),
    rules: 'required', // TODO: 异步校验唯一性验证
  },
  {
    component: 'Autocomplete',
    componentProps: {
      fetchSuggestions: querySearch,
      placeholder: $t('page.pleaseInput', [$t('sys.menu.component')]),
      teleported: false,
    },
    dependencies: {
      if(values) {
        return values.type !== MenuType.BUTTON;
      },
      triggerFields: ['type'],
    },
    fieldName: 'component',
    help: $t('sys.menu.tip.component'),
    label: $t('sys.menu.component'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.menu.permission')]),
    },
    dependencies: {
      if(values) {
        return values.type !== MenuType.DIR;
      },
      triggerFields: ['type'],
    },
    fieldName: 'permission',
    label: $t('sys.menu.permission'),
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
    label: $t('sys.menu.status'),
  },
]);

const [Form, formApi] = useVbenForm(
  reactive({
    commonConfig: {
      componentProps: {
        clearable: true,
      },
      labelClass: 'mr-4',
    },
    schema: formSchema,
    showDefaultActions: false,
    wrapperClass: 'grid-cols-1 lg:grid-cols-2 gap-x-4',
  }),
);

async function getValues() {
  const values = await formApi.getValues();
  const metaValues = await metaFormRef.value!.formApi.getValues();

  const formState = omit(cloneDeep(values), ['icon']);
  const meta = cloneDeep(metaValues);
  meta.icon = values.icon;
  formState.meta = meta;
  return formState;
}

function setValues(values: MenuApi.AddModel) {
  const formState = omit(values, ['meta']) as Record<string, any>;
  if (values.meta) {
    formState.icon = values.meta.icon;
    metaFormRef.value?.formApi.setValues(values.meta);
  }
  formApi.setValues(formState);
}

function closeMetaForm() {
  metaFormRef.value?.close();
}

defineExpose({
  closeMetaForm,
  formApi,
  getValues,
  setValues,
});
</script>

<template>
  <div>
    <Form />
    <MetaForm v-show="type !== MenuType.BUTTON" ref="metaFormRef" :type />
  </div>
</template>
