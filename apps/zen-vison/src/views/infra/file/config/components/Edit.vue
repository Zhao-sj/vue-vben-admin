<script setup lang="ts">
import type { FileApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { getFileConfigApi, updateFileConfigApi } from '#/api';
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

const { loading: dataLoading, runAsync: getFileConfig } = useRequest(
  getFileConfigApi,
  requestConf,
);

const { loading, runAsync } = useRequest(updateFileConfigApi, requestConf);

const [Drawer, drawer] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = drawer.getData();
  if (id) {
    const fileConfig = await getFileConfig(id);
    setTimeout(() => {
      optFormRef.value?.formApi.setValues(fileConfig, false);
    }, 0);
  }
}

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  await runAsync(values as FileApi.UpdateConfigModel);
  ElMessage.success($t('page.success'));
  drawer.close();
  emit('success');
}
</script>

<template>
  <Drawer
    :confirm-loading="loading"
    :loading="dataLoading"
    :title="$t('page.actionTitle.edit', [$t('infra.file.config.title')])"
    class="md:w-1/2 2xl:w-1/3"
    destroy-on-close
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" edit />
  </Drawer>
</template>
