<script setup lang="ts">
import type { RoleApi } from '#/api';

import { useVbenModal } from '@vben/common-ui';

import { getRoleApi, updateRoleApi } from '#/api';
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
  data: role,
  loading: roleLoading,
  runAsync: getRole,
} = useRequest(getRoleApi, requestConf);

const { loading, runAsync } = useRequest(updateRoleApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = modal.getData();
  if (id) {
    const role = await getRole(id);
    setTimeout(() => {
      optFormRef.value?.formApi.setValues(role);
    }, 0);
  }
}

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  await runAsync({ id: role.value.id, ...values } as RoleApi.UpdateModel);
  ElMessage.success($t('page.success'));
  modal.close();
  emit('success');
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="roleLoading"
    :title="$t('sys.role.edit')"
    class="w-11/12 lg:w-1/3 2xl:w-1/4"
    draggable
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" />
  </Modal>
</template>
