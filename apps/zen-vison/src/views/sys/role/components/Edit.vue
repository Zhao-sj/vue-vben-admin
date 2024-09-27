<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { omit } from 'lodash-es';

import { getRoleApi, type RoleApi, updateRoleApi } from '#/api';
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

const { loading: roleLoading, runAsync: getRole } = useRequest(
  getRoleApi,
  requestConf,
);

const { loading, runAsync } = useRequest(updateRoleApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = modal.getData();
  if (id) {
    const role = await getRole(id);
    const ignoreKeys = ['type', 'dataScope', 'dataScopeDeptIds', 'createTime'];
    const data = omit(role, ignoreKeys) as RoleApi.UpdateModel;
    setTimeout(() => {
      optFormRef.value?.formApi.setValues(data);
    }, 0);
  }
}

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  await runAsync(values as RoleApi.UpdateModel);
  ElMessage.success($t('zen.common.successTip'));
  modal.close();
  emit('success');
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="roleLoading"
    :title="$t('zen.service.role.edit')"
    class="w-11/12 lg:w-1/3 2xl:w-1/4"
    draggable
  >
    <OptForm ref="optFormRef" />
  </Modal>
</template>
