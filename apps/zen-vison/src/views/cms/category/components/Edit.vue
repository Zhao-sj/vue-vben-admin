<script setup lang="ts">
import type { CategoryApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { cloneDeep } from 'lodash-es';

import {
  getCmsCategoryApi,
  getCmsCategorySimpleApi,
  updateCmsCategoryApi,
} from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

import OptForm from './OptForm.vue';

interface Emits {
  (e: 'success'): void;
}

const emit = defineEmits<Emits>();

const requestConf = {
  loadingDelay: 200,
  manual: true,
};

const optFormRef = useTemplateRef('optFormRef');

const {
  data: categoryList,
  loading: categoryLoading,
  runAsync: getCategoryList,
} = useRequest(getCmsCategorySimpleApi, requestConf);

const {
  data: category,
  loading: dataLoading,
  runAsync: getData,
} = useRequest(getCmsCategoryApi, requestConf);

const { loading, runAsync } = useRequest(updateCmsCategoryApi, requestConf);
const [Drawer, drawer] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = drawer.getData();
  if (id) {
    const [category] = await Promise.all([getData(id), getCategoryList()]);

    setTimeout(() => {
      optFormRef.value?.formApi.setValues(category);
    }, 0);
  }
}

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  const state = cloneDeep(values as CategoryApi.UpdateModel);
  state.id = category.value.id;
  state.parentId = state.parentId || 0;

  await runAsync(state);
  ElMessage.success($t('page.success'));
  drawer.close();
  emit('success');
}
</script>

<template>
  <Drawer
    :confirm-loading="loading"
    :loading="categoryLoading || dataLoading"
    :title="$t('page.actionTitle.edit', [$t('cms.category.title')])"
    class="lg:w-1/3 2xl:w-1/4"
    destroy-on-close
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" :category-list />
  </Drawer>
</template>
