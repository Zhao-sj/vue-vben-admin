<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { cloneDeep } from 'lodash-es';

import {
  addCmsCategoryApi,
  type CategoryApi,
  getCmsCategorySimpleApi,
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
  data: categoryList,
  loading: categoryLoading,
  runAsync: getCategoryList,
} = useRequest(getCmsCategorySimpleApi, requestConf);

const { loading, runAsync } = useRequest(addCmsCategoryApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    await getCategoryList();
    const { parentId } = modal.getData();
    if (parentId) {
      setTimeout(() => {
        optFormRef.value?.formApi.setFieldValue('parentId', parentId);
      }, 0);
    }

    return;
  }

  modal.setData({ parentId: null });
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
  modal.close();
  emit('success');
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="categoryLoading"
    :title="$t('cms.category.create')"
    class="w-11/12 lg:w-1/3 2xl:w-1/4"
    draggable
  >
    <OptForm ref="optFormRef" :category-list />
  </Modal>
</template>
