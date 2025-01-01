<script setup lang="ts">
import type { DeptApi } from '#/api';

import { useVbenModal } from '@vben/common-ui';

import { cloneDeep } from 'lodash-es';

import { addDeptApi, getDeptSimpleListApi, getUserSimpleListApi } from '#/api';
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
  data: deptList,
  loading: deptLoading,
  runAsync: getDeptList,
} = useRequest(getDeptSimpleListApi, requestConf);

const {
  data: userList,
  loading: userLoading,
  runAsync: getUserList,
} = useRequest(getUserSimpleListApi, requestConf);

const { loading, runAsync } = useRequest(addDeptApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    await Promise.all([getDeptList(), getUserList()]);
    const { parentId } = modal.getData();
    if (parentId) {
      setTimeout(() => {
        optFormRef.value?.formApi.setFieldValue('parentId', parentId);
      }, 0);
    }

    return;
  }

  modal.setData({ parentId: null });
}

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  const state = cloneDeep(values as DeptApi.AddModel);
  state.parentId = state.parentId || 0;

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
    :loading="deptLoading || userLoading"
    :title="$t('sys.dept.create')"
    class="w-11/12 md:w-1/2 2xl:w-1/3"
    draggable
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" :dept-list :user-list />
  </Modal>
</template>
