<script setup lang="ts">
import type { ArticleApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { cloneDeep } from 'lodash-es';

import {
  addCmsArticleApi,
  getCmsCategorySimpleApi,
  getCmsTagSimpleApi,
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

const optFormRef = useTemplateRef<InstanceType<typeof OptForm>>('optFormRef');

const {
  loading: categoryLoading,
  data: categoryList,
  runAsync: getCategory,
} = useRequest(getCmsCategorySimpleApi, requestConf);

const {
  loading: tagLoading,
  data: tagList,
  runAsync: getTag,
} = useRequest(getCmsTagSimpleApi, requestConf);

const { loading, runAsync } = useRequest(addCmsArticleApi, requestConf);

const [Drawer, modal] = useVbenDrawer({ onConfirm, onOpenChange });

function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  Promise.all([getCategory(), getTag()]);
}

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  const state = cloneDeep(values);
  state.categoryId = state.categoryId[state.categoryId.length - 1]; // 修正分类ID
  await runAsync(state as ArticleApi.AddModel);
  ElMessage.success($t('page.success'));
  modal.close();
  emit('success');
}
</script>

<template>
  <Drawer
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="categoryLoading || tagLoading"
    :title="$t('cms.article.create')"
    class="w-full lg:w-1/2"
    draggable
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" :category-list :tag-list />
  </Drawer>
</template>
