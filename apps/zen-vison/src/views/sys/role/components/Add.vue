<script setup lang="ts">
import type { RoleApi } from '#/api';

import { useVbenModal } from '@vben/common-ui';

import { addRoleApi } from '#/api';
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

const { loading, runAsync } = useRequest(addRoleApi, requestConf);

const [Modal, modalApi] = useVbenModal({ onConfirm });

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();

  await runAsync(values as RoleApi.AddModel);
  ElMessage.success($t('page.success'));
  modalApi.close();
  emit('success');
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :title="$t('page.actionTitle.create', [$t('sys.role.title')])"
    class="w-11/12 lg:w-1/3 2xl:w-1/4"
    draggable
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" />
  </Modal>
</template>
