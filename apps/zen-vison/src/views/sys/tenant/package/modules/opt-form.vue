<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';
import type { MenuApi } from '#/api';

import { useVbenForm } from '#/adapter/form';
import { MenuSelectTable } from '#/components';
import { $t } from '#/locales';

interface Props {
  menus?: MenuApi.Simple[];
}

withDefaults(defineProps<Props>(), {
  menus: () => [],
});

const menuSelectRef = useTemplateRef('menuSelectTable');

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('sys.tenant.package.name'),
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'menuIds',
    label: $t('sys.tenant.package.menu'),
  },
  {
    component: 'Input',
    componentProps: {
      autosize: {
        maxRows: 5,
        minRows: 3,
      },
      resize: 'none',
      type: 'textarea',
    },
    fieldName: 'remark',
    label: $t('sys.tenant.package.remark'),
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
      formItemClass: 'flex-col items-start [&>*]:w-full',
    },
    schema: formSchema,
    showDefaultActions: false,
    wrapperClass: 'grid-cols-1',
  }),
);

function getMenuSelectInstance() {
  return menuSelectRef.value;
}

defineExpose({
  formApi,
  getMenuSelectInstance,
});
</script>

<template>
  <Form>
    <template #menuIds>
      <div class="h-[600px] w-full">
        <MenuSelectTable ref="menuSelectTable" :menus />
      </div>
    </template>
  </Form>
</template>
