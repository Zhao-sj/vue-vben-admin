<script setup lang="ts">
import type { OAuth2Api } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { getOAuth2ClientApi, updateOAuth2ClientApi } from '#/api';
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

const {
  data: client,
  loading: clientLoading,
  runAsync: getClient,
} = useRequest(getOAuth2ClientApi, requestConf);

const { loading, runAsync } = useRequest(updateOAuth2ClientApi, requestConf);

const [Drawer, drawer] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = drawer.getData();
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
  ElMessage.success($t('page.success'));
  drawer.close();
  emit('success');
}
</script>

<template>
  <Drawer
    :confirm-loading="loading"
    :loading="clientLoading"
    :title="$t('page.actionTitle.edit', [$t('sys.oauth2.client.title')])"
    class="lg:w-1/2 2xl:w-1/3"
    destroy-on-close
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" />
  </Drawer>
</template>
