<script setup lang="ts">
import type { TenantApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

import { addTenantApi, getTenantPackageSimpleListApi } from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { encryptBySha256 } from '#/utils';

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
  data: packages,
  loading: pckLoading,
  run: getPackage,
} = useRequest(getTenantPackageSimpleListApi, requestConf);

const { loading, runAsync } = useRequest(addTenantApi, requestConf);

const [Drawer, drawer] = useVbenDrawer({ onConfirm, onOpenChange });

function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    getPackage();
  }
}

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  const state = cloneDeep(values as TenantApi.AddModel);
  state.password = encryptBySha256(state.password);
  state.expireTime = dayjs(state.expireTime).valueOf();

  await runAsync(state);
  ElMessage.success($t('page.success'));
  drawer.close();
  emit('success');
}
</script>

<template>
  <Drawer
    :confirm-loading="loading"
    :loading="pckLoading"
    :title="$t('page.actionTitle.create', [$t('sys.tenant.list.title')])"
    class="md:w-1/2 2xl:w-1/3"
    destroy-on-close
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" :packages />
  </Drawer>
</template>
