<script setup lang="ts">
import type { TenantApi } from '#/api';

import { useVbenModal } from '@vben/common-ui';

import { cloneDeep } from 'lodash-es';

import { addTenantPackageApi, getMenuSimpleListApi } from '#/api';
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

const { loading, runAsync } = useRequest(addTenantPackageApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

const treeInstance = computed(() => optFormRef.value?.getTreeInstance());

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
  const keys = treeInstance.value!.getCheckedKeys() as number[];
  state.menuIds = keys;

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
    :loading="menuLoading"
    :title="$t('page.actionTitle.create', [$t('sys.tenant.package.title')])"
    class="w-11/12 md:w-1/2 2xl:w-1/3"
    draggable
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" :menus />
  </Modal>
</template>
