<script setup lang="ts">
import type { PostApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { addPostApi } from '#/api';
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

const { loading, runAsync } = useRequest(addPostApi, requestConf);

const [Drawer, drawer] = useVbenDrawer({ onConfirm });

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  await runAsync(values as PostApi.AddModel);
  ElMessage.success($t('page.success'));
  drawer.close();
  emit('success');
}
</script>

<template>
  <Drawer
    :confirm-loading="loading"
    :title="$t('page.actionTitle.create', [$t('sys.post.title')])"
    class="lg:w-1/3 2xl:w-1/4"
    destroy-on-close
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" />
  </Drawer>
</template>
