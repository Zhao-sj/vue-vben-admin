<script setup lang="ts">
import type { ArticleApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { cloneDeep } from 'lodash-es';

import {
  getCmsArticleApi,
  getCmsCategorySimpleApi,
  getCmsTagSimpleApi,
  updateCmsArticleApi,
} from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

import OptForm from './opt-form.vue';

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
  loading: categoryLoading,
  data: categoryList,
  runAsync: getCategory,
} = useRequest(getCmsCategorySimpleApi, requestConf);

const {
  loading: tagLoading,
  data: tagList,
  runAsync: getTag,
} = useRequest(getCmsTagSimpleApi, requestConf);

const {
  data: article,
  loading: dataLoading,
  runAsync: getArticle,
} = useRequest(getCmsArticleApi, requestConf);

const { loading, runAsync } = useRequest(updateCmsArticleApi, requestConf);

const [Drawer, modal] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = modal.getData();
  if (id) {
    const [article] = await Promise.all([
      getArticle(id),
      getCategory(),
      getTag(),
    ]);

    setTimeout(() => {
      optFormRef.value?.formApi.setValues({
        ...article,
        tagIds: article.tagList.map((item) => item.id),
      });
    }, 0);
  }
}

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  const state = cloneDeep(values);
  state.categoryId = state.categoryId[state.categoryId.length - 1]; // 修正分类ID
  await runAsync({ id: article.value.id, ...values } as ArticleApi.UpdateModel);
  ElMessage.success($t('page.success'));
  modal.close();
  emit('success');
}
</script>

<template>
  <Drawer
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="dataLoading || categoryLoading || tagLoading"
    :title="$t('page.actionTitle.edit', [$t('cms.article.name')])"
    class="w-full lg:w-1/2"
    destroy-on-close
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" :category-list :tag-list />
  </Drawer>
</template>
