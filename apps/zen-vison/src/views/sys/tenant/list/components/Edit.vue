<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { omit } from 'lodash-es';

import {
  getTenantApi,
  getTenantPackageSimpleListApi,
  type TenantApi,
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

const optFormRef = ref<InstanceType<typeof OptForm>>();
const formState = ref<Partial<TenantApi.UpdateModel>>({});

const {
  data: packages,
  loading: pckLoading,
  runAsync: getPackage,
} = useRequest(getTenantPackageSimpleListApi, requestConf);

const { loading: tentantLoading, runAsync: getTenant } = useRequest(
  getTenantApi,
  requestConf,
);

const { loading, runAsync } = useRequest(updateTenantApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

const formInstance = computed(() => optFormRef.value?.getFormInstance());

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = modal.getData();
  if (id) {
    const [tenant] = await Promise.all([getTenant(id), getPackage()]);
    const ignoreKeys = ['createTime'];
    formState.value = omit(tenant, ignoreKeys) as TenantApi.UpdateModel;
  }
}

function onConfirm() {
  formInstance.value?.validate(async (valid) => {
    if (valid) {
      await runAsync(formState.value as TenantApi.UpdateModel);
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
    :loading="pckLoading || tentantLoading"
    :title="$t('zen.service.tenant.edit')"
    class="w-11/12 md:w-1/2 2xl:w-1/3"
    draggable
  >
    <OptForm ref="optFormRef" v-model="formState" :packages edit />
  </Modal>
</template>
