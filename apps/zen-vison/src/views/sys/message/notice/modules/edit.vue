<script setup lang="ts">
import type { NoticeApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { getNoticeApi, updateNoticeApi } from '#/api';
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
  data: notice,
  loading: noticeLoading,
  runAsync: getNotice,
} = useRequest(getNoticeApi, requestConf);

const { loading, runAsync } = useRequest(updateNoticeApi, requestConf);

const [Drawer, drawer] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = drawer.getData();
  if (id) {
    const notice = await getNotice(id);
    setTimeout(() => {
      optFormRef.value?.formApi.setValues(notice);
    }, 0);
  }
}

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  await runAsync({ id: notice.value.id, ...values } as NoticeApi.UpdateModel);
  ElMessage.success($t('page.success'));
  drawer.close();
  emit('success');
}
</script>

<template>
  <Drawer
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="noticeLoading"
    :title="$t('page.actionTitle.edit', [$t('sys.message.notice.name')])"
    class="w-full lg:w-1/2"
    destroy-on-close
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" />
  </Drawer>
</template>
