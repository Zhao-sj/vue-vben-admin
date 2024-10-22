<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import {
  getOAuth2ClientApi,
  type OAuth2Api,
  updateOAuth2ClientApi,
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
  data: client,
  loading: clientLoading,
  runAsync: getClient,
} = useRequest(getOAuth2ClientApi, requestConf);

const { loading, runAsync } = useRequest(updateOAuth2ClientApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = modal.getData();
  if (id) {
    const client = await getClient(id);
    setTimeout(() => {
      optFormRef.value?.formApi.setValues(client);
    }, 0);
  }
}

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  await runAsync({ id: client.value.id, ...values } as OAuth2Api.UpdateModel);
  ElMessage.success($t('zen.common.successTip'));
  modal.close();
  emit('success');
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="clientLoading"
    :title="$t('zen.service.oauth2.client.edit')"
    class="w-11/12 lg:w-1/2 2xl:w-1/3"
    draggable
  >
    <OptForm ref="optFormRef" />
  </Modal>
</template>
