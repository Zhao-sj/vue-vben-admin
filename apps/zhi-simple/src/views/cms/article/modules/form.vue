<script setup lang="ts">
import type { ArticleApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { isEmpty } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import { addCmsArticleApi, getCmsArticleApi, updateCmsArticleApi } from '#/api';
import { Tinymce } from '#/components';
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
    ? $t('page.actionTitle.edit', [$t('cms.article.name')])
    : $t('page.actionTitle.create', [$t('cms.article.name')]);
});

const { loading, runAsync: getArticle } = useRequest(getCmsArticleApi, {
  loadingDelay: 200,
  manual: true,
});

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      clearable: true,
    },
    labelClass: 'mr-4',
    labelWidth: 40,
  },
  schema: useFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 lg:grid-cols-3 gap-x-4',
});

const [Drawer, drawerApi] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    formApi.updateSchema(useFormSchema());
    const data = drawerApi.getData<ArticleApi.Article>();
    if (!isEmpty(data)) {
      const article = await getArticle(data.id);
      const tagIds = article.tagList.map((item) => item.id);
      id.value = article.id;
      formApi.setValues(article);
      formApi.setFieldValue('tagIds', tagIds);
      formApi.setFieldValue('id', article.id);
    }
  }
}

async function onConfirm() {
  const { valid } = await formApi.validate();
  if (!valid) return;
  const values = await formApi.getValues();
  // 修正分类ID
  values.categoryId = Array.isArray(values.categoryId)
    ? values.categoryId[values.categoryId.length - 1]
    : values.categoryId;
  drawerApi.lock();
  (id.value
    ? updateCmsArticleApi(values as ArticleApi.UpdateModel)
    : addCmsArticleApi(values as ArticleApi.AddModel)
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
    :close-on-click-modal="false"
    class="w-full lg:w-1/2"
    footer-class="gap-x-0"
  >
    <Form>
      <template #content="slotProps">
        <Tinymce v-bind="slotProps" />
      </template>
    </Form>
  </Drawer>
</template>
