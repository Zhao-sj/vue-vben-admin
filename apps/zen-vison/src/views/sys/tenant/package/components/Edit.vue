<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { omit } from 'lodash-es';

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

const optFormRef = ref<InstanceType<typeof OptForm>>();
const formState = ref<Partial<TenantApi.AddPackageModel>>({});

const {
  data: menus,
  loading: menuLoading,
  runAsync: getMenu,
} = useRequest(getMenuSimpleListApi, requestConf);

const { loading: pckLoading, runAsync: getPackage } = useRequest(
  getTenantPackageApi,
  requestConf,
);

const { loading, runAsync } = useRequest(updateTenantPackageApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

const formInstance = computed(() => optFormRef.value?.getFormInstance());
const treeInstance = computed(() => optFormRef.value?.getTreeInstance());

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = modal.getData();
  if (id) {
    const [tenantPackage] = await Promise.all([getPackage(id), getMenu()]);
    const ignoreKeys = ['createTime'];
    formState.value = omit(tenantPackage, ignoreKeys) as TenantApi.UpdateModel;
    treeInstance.value?.setCheckedKeys(tenantPackage.menuIds);
  }
}

function onConfirm() {
  formInstance.value?.validate(async (valid) => {
    if (valid) {
      const keys = treeInstance.value!.getCheckedKeys() as number[];
      formState.value.menuIds = keys;

      await runAsync(formState.value as TenantApi.UpdatePackageModel);
      ElMessage.success($t('zen.common.successTip'));
      modal.close();
      emit('success');
    }
  });
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
    <OptForm ref="optFormRef" v-model="formState" :menus />
  </Modal>
</template>
