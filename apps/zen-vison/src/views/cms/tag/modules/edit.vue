<script setup lang="ts">
import type { TagApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { getCmsTagApi, updateCmsTagApi } from '#/api';
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
  data: tag,
  loading: tagLoading,
  runAsync: getTag,
} = useRequest(getCmsTagApi, requestConf);

const { loading, runAsync } = useRequest(updateCmsTagApi, requestConf);
const [Drawer, drawer] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = drawer.getData();
  if (id) {
    const role = await getTag(id);
    setTimeout(() => {
      optFormRef.value?.formApi.setValues(role);
    }, 0);
  }
}

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  await runAsync({ id: tag.value.id, ...values } as TagApi.UpdateModel);
  ElMessage.success($t('page.success'));
  drawer.close();
  emit('success');
}
</script>

<template>
  <Drawer
    :confirm-loading="loading"
    :loading="tagLoading"
    :title="$t('page.actionTitle.edit', [$t('cms.tag.title')])"
    class="lg:w-1/3 2xl:w-1/4"
    destroy-on-close
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" />
  </Drawer>
</template>
