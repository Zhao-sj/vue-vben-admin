<script setup lang="ts">
import type { FileApi } from '#/api';

import { useVbenModal } from '@vben/common-ui';

import { cloneDeep } from 'lodash-es';

import { addFileConfigApi } from '#/api';
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

const { loading, runAsync } = useRequest(addFileConfigApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm });

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  const state = cloneDeep(values as FileApi.AddConfigModel);

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
    :title="$t('infra.file.config.create')"
    class="w-11/12 md:w-1/2 2xl:w-1/3"
    draggable
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" />
  </Modal>
</template>
