<script setup lang="ts">
import type { TenantApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { cloneDeep } from 'lodash-es';

import { addTenantPackageApi, getMenuSimpleListApi } from '#/api';
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
  data: menus,
  loading: menuLoading,
  runAsync: getMenu,
} = useRequest(getMenuSimpleListApi, requestConf);

const { loading, runAsync } = useRequest(addTenantPackageApi, requestConf);

const [Drawer, drawer] = useVbenDrawer({ onConfirm, onOpenChange });

const menuSelectInstance = computed(() =>
  optFormRef.value?.getMenuSelectInstance(),
);

function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    getMenu();
  }
}

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  const state = cloneDeep(values as TenantApi.AddPackageModel);
  const keys = menuSelectInstance.value!.getCheckedKeys() as number[];
  state.menuIds = keys;

  await runAsync(state);
  ElMessage.success($t('page.success'));
  drawer.close();
  emit('success');
}
</script>

<template>
  <Drawer
    :confirm-loading="loading"
    :loading="menuLoading"
    :title="$t('page.actionTitle.create', [$t('sys.tenant.package.title')])"
    class="md:w-1/2 2xl:w-2/5"
    destroy-on-close
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" :menus />
  </Drawer>
</template>
