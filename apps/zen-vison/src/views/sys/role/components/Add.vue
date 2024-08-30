<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { cloneDeep } from 'lodash-es';

import { addRoleApi, type RoleApi } from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

import OptForm from './OptForm.vue';

interface Emits {
  (e: 'success'): void;
}

const emit = defineEmits<Emits>();

const defaultState = {};
const requestConf = {
  loadingDelay: 200,
  manual: true,
};

const optFormRef = ref<InstanceType<typeof OptForm>>();
const formState = ref<Partial<RoleApi.AddModel>>(cloneDeep(defaultState));

const { loading, runAsync } = useRequest(addRoleApi, requestConf);

const [Modal, modalApi] = useVbenModal({ onConfirm, onOpenChange });

const formInstance = computed(() => optFormRef.value?.getFormInstance());

async function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    return;
  }

  formState.value = cloneDeep(defaultState);
}

function onConfirm() {
  formInstance.value?.validate(async (valid) => {
    if (valid) {
      const state = cloneDeep(formState.value as RoleApi.AddModel);

      await runAsync(state);
      ElMessage.success($t('zen.common.successTip'));
      modalApi.close();
      emit('success');
    }
  });
}
</script>

<template>
  <Modal
    :cancel-text="$t('zen.common.cancel')"
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :confirm-text="$t('zen.common.confirm')"
    :title="$t('zen.service.role.create')"
    class="w-11/12 lg:w-1/3 2xl:w-1/4"
    draggable
  >
    <OptForm ref="optFormRef" v-model="formState" />
  </Modal>
</template>
