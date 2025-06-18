<script setup lang="ts">
import type { MenuApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

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

const optFormRef = useTemplateRef('optFormRef');

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

const [Drawer, drawer] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = drawer.getData();
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
  drawer.close();
  emit('success');
}
</script>

<template>
  <Drawer
    :confirm-loading="loading"
    :loading="menuLoading || pckLoading"
    :title="$t('page.actionTitle.edit', [$t('sys.menu.title')])"
    class="md:w-1/2 2xl:w-1/3"
    destroy-on-close
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" :menus />
  </Drawer>
</template>
