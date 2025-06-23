<script setup lang="ts">
import type { PostApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { getPostApi, updatePostApi } from '#/api';
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
  data: post,
  loading: postLoading,
  runAsync: getPost,
} = useRequest(getPostApi, requestConf);

const { loading, runAsync } = useRequest(updatePostApi, requestConf);

const [Drawer, drawer] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = drawer.getData();
  if (id) {
    const role = await getPost(id);
    setTimeout(() => {
      optFormRef.value?.formApi.setValues(role);
    }, 0);
  }
}

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  await runAsync({ id: post.value.id, ...values } as PostApi.UpdateModel);
  ElMessage.success($t('page.success'));
  drawer.close();
  emit('success');
}
</script>

<template>
  <Drawer
    :confirm-loading="loading"
    :loading="postLoading"
    :title="$t('page.actionTitle.edit', [$t('sys.post.title')])"
    class="lg:w-1/3 2xl:w-1/4"
    destroy-on-close
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" />
  </Drawer>
</template>
