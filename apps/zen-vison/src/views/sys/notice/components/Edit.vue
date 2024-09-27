<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { omit } from 'lodash-es';

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

const { loading: noticeLoading, runAsync: getNotice } = useRequest(
  getNoticeApi,
  requestConf,
);

const { loading, runAsync } = useRequest(updateNoticeApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = modal.getData();
  if (id) {
    const notice = await getNotice(id);
    const ignoreKeys = ['createTime'];
    optFormRef.value?.formApi.setValues(omit(notice, ignoreKeys));
  }
}

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  await runAsync(values as NoticeApi.UpdateModel);
  ElMessage.success($t('zen.common.successTip'));
  modal.close();
  emit('success');
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="noticeLoading"
    :title="$t('zen.service.notice.edit')"
    class="w-11/12 lg:w-1/2 2xl:w-1/3"
    draggable
  >
    <OptForm ref="optFormRef" />
  </Modal>
</template>
