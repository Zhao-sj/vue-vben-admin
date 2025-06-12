<script setup lang="ts">
import type { TenantApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

import {
  getTenantApi,
  getTenantPackageSimpleListApi,
  updateTenantApi,
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
  data: packages,
  loading: pckLoading,
  runAsync: getPackage,
} = useRequest(getTenantPackageSimpleListApi, requestConf);

const {
  data: tenant,
  loading: tentantLoading,
  runAsync: getTenant,
} = useRequest(getTenantApi, requestConf);

const { loading, runAsync } = useRequest(updateTenantApi, requestConf);

const [Drawer, drawer] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = drawer.getData();
  if (id) {
    const [tenant] = await Promise.all([getTenant(id), getPackage()]);
    setTimeout(() => {
      optFormRef.value?.formApi.setValues(tenant);
    }, 0);
  }
}

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  const state = cloneDeep(values);
  state.id = tenant.value.id;
  state.expireTime = dayjs(state.expireTime).valueOf();
  await runAsync(state as TenantApi.UpdateModel);
  ElMessage.success($t('page.success'));
  drawer.close();
  emit('success');
}
</script>

<template>
  <Drawer
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="pckLoading || tentantLoading"
    :title="$t('page.actionTitle.edit', [$t('sys.tenant.list.title')])"
    class="md:w-1/2 2xl:w-1/3"
    draggable
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" :packages edit />
  </Drawer>
</template>
