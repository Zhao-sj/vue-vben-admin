<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { getNoticeApi, type NoticeApi, updateNoticeApi } from '#/api';
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
  data: notice,
  loading: noticeLoading,
  runAsync: getNotice,
} = useRequest(getNoticeApi, requestConf);

const { loading, runAsync } = useRequest(updateNoticeApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = modal.getData();
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
  ElMessage.success($t('page.successTip'));
  modal.close();
  emit('success');
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="noticeLoading"
    :title="$t('sys.message.notice.edit')"
    class="w-11/12 lg:w-1/2 2xl:w-1/3"
    draggable
  >
    <OptForm ref="optFormRef" />
  </Modal>
</template>
