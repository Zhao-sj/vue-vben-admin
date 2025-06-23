<script setup lang="ts">
import type { TenantApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { cloneDeep } from 'lodash-es';

import {
  getMenuSimpleListApi,
  getTenantPackageApi,
  updateTenantPackageApi,
} from '#/api';
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

const {
  data: tenantPackage,
  loading: pckLoading,
  runAsync: getPackage,
} = useRequest(getTenantPackageApi, requestConf);

const { loading, runAsync } = useRequest(updateTenantPackageApi, requestConf);

const [Drawer, drawer] = useVbenDrawer({ onConfirm, onOpenChange });

const menuSelectInstance = computed(() =>
  optFormRef.value?.getMenuSelectInstance(),
);

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = drawer.getData();
  if (id) {
    const [tenantPackage] = await Promise.all([getPackage(id), getMenu()]);
    setTimeout(() => {
      optFormRef.value?.formApi.setValues(tenantPackage);
      menuSelectInstance.value?.setCheckedKeys(tenantPackage.menuIds);
    }, 0);
  }
}

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  const state = cloneDeep({
    id: tenantPackage.value.id,
    ...values,
  } as TenantApi.UpdatePackageModel);
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
    :loading="menuLoading || pckLoading"
    :title="$t('page.actionTitle.edit', [$t('sys.tenant.package.title')])"
    class="md:w-1/2 2xl:w-2/5"
    destroy-on-close
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" :menus />
  </Drawer>
</template>
