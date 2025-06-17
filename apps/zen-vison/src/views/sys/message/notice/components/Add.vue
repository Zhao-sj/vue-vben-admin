<script setup lang="ts">
import type { NoticeApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { addNoticeApi } from '#/api';
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

const { loading, runAsync } = useRequest(addNoticeApi, requestConf);

const [Drawer, drawer] = useVbenDrawer({ onConfirm });

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  await runAsync(values as NoticeApi.AddModel);
  ElMessage.success($t('page.success'));
  drawer.close();
  emit('success');
}
</script>

<template>
  <Drawer
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :title="$t('page.actionTitle.create', [$t('sys.message.notice.name')])"
    class="w-full lg:w-1/2"
    destroy-on-close
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" />
  </Drawer>
</template>
