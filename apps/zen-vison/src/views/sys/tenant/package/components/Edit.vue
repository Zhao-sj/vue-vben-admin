<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { cloneDeep } from 'lodash-es';

import {
  getMenuSimpleListApi,
  getTenantPackageApi,
  type TenantApi,
  updateTenantPackageApi,
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

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

const treeInstance = computed(() => optFormRef.value?.getTreeInstance());

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = modal.getData();
  if (id) {
    const [tenantPackage, menus] = await Promise.all([
      getPackage(id),
      getMenu(),
    ]);

    const isCheckAll = menus.every((item) =>
      tenantPackage.menuIds.includes(item.id),
    );

    setTimeout(() => {
      optFormRef.value?.formApi.setValues(tenantPackage);
      optFormRef.value?.setCheckAll(isCheckAll);
      treeInstance.value?.setCheckedKeys(tenantPackage.menuIds);
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
  const keys = treeInstance.value!.getCheckedKeys() as number[];
  state.menuIds = keys;

  await runAsync(state);
  ElMessage.success($t('zen.common.successTip'));
  modal.close();
  emit('success');
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="menuLoading || pckLoading"
    :title="$t('zen.service.package.edit')"
    class="w-11/12 md:w-1/2 2xl:w-1/3"
    draggable
  >
    <OptForm ref="optFormRef" :menus />
  </Modal>
</template>
