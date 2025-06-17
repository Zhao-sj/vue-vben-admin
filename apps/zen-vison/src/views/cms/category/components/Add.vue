<script setup lang="ts">
import type { CategoryApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { cloneDeep } from 'lodash-es';

import { addCmsCategoryApi, getCmsCategorySimpleApi } from '#/api';
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

const optFormRef = useTemplateRef<InstanceType<typeof OptForm>>('optFormRef');

const {
  data: categoryList,
  loading: categoryLoading,
  runAsync: getCategoryList,
} = useRequest(getCmsCategorySimpleApi, requestConf);

const { loading, runAsync } = useRequest(addCmsCategoryApi, requestConf);

const [Drawer, drawer] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    await getCategoryList();
    const { parentId } = drawer.getData();
    if (parentId) {
      setTimeout(() => {
        optFormRef.value?.formApi.setFieldValue('parentId', parentId);
      }, 0);
    }

    return;
  }

  drawer.setData({ parentId: null });
}

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  const state = cloneDeep(values as CategoryApi.AddModel);
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
    :loading="categoryLoading"
    :title="$t('page.actionTitle.create', [$t('cms.category.title')])"
    class="lg:w-1/3 2xl:w-1/4"
    destroy-on-close
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" :category-list />
  </Drawer>
</template>
