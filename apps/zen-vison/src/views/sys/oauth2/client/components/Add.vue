<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { addOAuth2ClientApi, type OAuth2Api } from '#/api';
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

const { loading, runAsync } = useRequest(addOAuth2ClientApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm });

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  await runAsync(values as OAuth2Api.AddModel);
  ElMessage.success($t('page.success'));
  modal.close();
  emit('success');
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :title="$t('sys.oauth2.client.create')"
    class="w-11/12 lg:w-1/2 2xl:w-1/3"
    draggable
  >
    <OptForm ref="optFormRef" />
  </Modal>
</template>
