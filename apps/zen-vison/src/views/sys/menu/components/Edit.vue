<script setup lang="ts">
import type { MenuApi } from '#/api';

import { useVbenModal } from '@vben/common-ui';

import { getMenuApi, getMenuSimpleListApi, updateMenuApi } from '#/api';
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
  data: menus,
  loading: menuLoading,
  runAsync: getMenu,
} = useRequest(getMenuSimpleListApi, requestConf);

const {
  data: menu,
  loading: pckLoading,
  runAsync: getData,
} = useRequest(getMenuApi, requestConf);

const { loading, runAsync } = useRequest(updateMenuApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = modal.getData();
  if (id) {
    const [menu] = await Promise.all([getData(id), getMenu()]);
    setTimeout(() => {
      optFormRef.value?.setValues(menu as MenuApi.UpdateModel);
    }, 0);
  }
}

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) {
    optFormRef.value?.closeMetaForm();
    return;
  }

  const values = await optFormRef.value.getValues();
  await runAsync({ id: menu.value.id, ...values } as MenuApi.UpdateModel);
  ElMessage.success($t('page.success'));
  modal.close();
  emit('success');
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="menuLoading || pckLoading"
    :title="$t('sys.menu.edit')"
    class="w-11/12 md:w-1/2 2xl:w-1/3"
    draggable
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" :menus />
  </Modal>
</template>
