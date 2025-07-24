<script setup lang="ts">
import type { CategoryApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import {
  addCmsCategoryApi,
  getCmsCategoryApi,
  updateCmsCategoryApi,
} from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

interface Emits {
  (e: 'success'): void;
}

const emit = defineEmits<Emits>();

const id = ref<number>();

const getDrawerTitle = computed(() => {
  return id.value
    ? $t('page.actionTitle.edit', [$t('cms.category.title')])
    : $t('page.actionTitle.create', [$t('cms.category.title')]);
});

const { loading, runAsync: getCategory } = useRequest(getCmsCategoryApi, {
  loadingDelay: 200,
  manual: true,
});

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      clearable: true,
    },
    labelClass: 'mr-4',
    labelWidth: 80,
  },
  schema: useFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

const [Drawer, drawerApi] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    formApi.updateSchema(useFormSchema());
    const { id: categoryId, parentId } =
      drawerApi.getData<CategoryApi.Category>();
    if (parentId) {
      formApi.setFieldValue('parentId', parentId);
    }
    if (categoryId) {
      const dept = await getCategory(categoryId);
      id.value = categoryId;
      formApi.setValues(dept);
      formApi.setFieldValue('id', categoryId);
    }
  }
}

async function onConfirm() {
  const { valid } = await formApi.validate();
  if (!valid) return;
  const values = await formApi.getValues();
  drawerApi.lock();
  (id.value
    ? updateCmsCategoryApi(values as CategoryApi.UpdateModel)
    : addCmsCategoryApi(values as CategoryApi.AddModel)
  )
    .then(() => {
      emit('success');
      drawerApi.close();
    })
    .catch(() => {
      drawerApi.unlock();
    });
}
</script>

<template>
  <Drawer
    :loading
    :title="getDrawerTitle"
    class="lg:w-1/3 2xl:w-1/4"
    footer-class="gap-x-0"
  >
    <Form />
  </Drawer>
</template>
