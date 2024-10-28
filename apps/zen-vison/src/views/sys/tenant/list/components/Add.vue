<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';

import {
  addTenantApi,
  getTenantPackageSimpleListApi,
  type TenantApi,
} from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { encryptBySha256 } from '#/utils';

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
  run: getPackage,
} = useRequest(getTenantPackageSimpleListApi, requestConf);

const { loading, runAsync } = useRequest(addTenantApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

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
  modal.close();
  emit('success');
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="pckLoading"
    :title="$t('sys.tenant.list.create')"
    class="w-11/12 md:w-1/2 2xl:w-1/3"
    draggable
  >
    <OptForm ref="optFormRef" :packages />
  </Modal>
</template>
