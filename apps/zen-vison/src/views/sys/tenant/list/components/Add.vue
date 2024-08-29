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

const defaultState = { status: 0 };
const requestConf = {
  loadingDelay: 200,
  manual: true,
};

const optFormRef = ref<InstanceType<typeof OptForm>>();
const formState = ref<Partial<TenantApi.AddModel>>(cloneDeep(defaultState));

const {
  data: packages,
  loading: pckLoading,
  run: getPackage,
} = useRequest(getTenantPackageSimpleListApi, requestConf);

const { loading, runAsync } = useRequest(addTenantApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

const formInstance = computed(() => optFormRef.value?.getFormInstance());

function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    getPackage();
    return;
  }

  formState.value = cloneDeep(defaultState);
}

function onConfirm() {
  formInstance.value?.validate(async (valid) => {
    if (valid) {
      const state = cloneDeep(formState.value as TenantApi.AddModel);
      state.password = encryptBySha256(state.password);
      state.expireTime = dayjs(state.expireTime).valueOf();

      await runAsync(state);
      ElMessage.success($t('zen.common.successTip'));
      modal.close();
      emit('success');
    }
  });
}
</script>

<template>
  <Modal
    :cancel-text="$t('zen.common.cancel')"
    :confirm-loading="loading"
    :confirm-text="$t('zen.common.confirm')"
    :loading="pckLoading"
    :title="$t('zen.service.tenant.create')"
    class="w-11/12 md:w-1/2 2xl:w-1/3"
  >
    <OptForm ref="optFormRef" v-model="formState" :packages />
  </Modal>
</template>
