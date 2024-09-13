<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { cloneDeep } from 'lodash-es';

import {
  addDeptApi,
  type DeptApi,
  getDeptSimpleListApi,
  getUserSimpleListApi,
} from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

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
const formState = ref<Partial<DeptApi.AddModel>>(cloneDeep(defaultState));

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

const formInstance = computed(() => optFormRef.value?.getFormInstance());

async function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    await Promise.all([getDeptList(), getUserList()]);
    const { parentId } = modal.getData();
    if (parentId) {
      formState.value.parentId = parentId;
    }

    return;
  }

  modal.setData({ parentId: null });
  formState.value = cloneDeep(defaultState);
}

function onConfirm() {
  formInstance.value?.validate(async (valid) => {
    if (valid) {
      const state = formState.value as DeptApi.AddModel;
      state.parentId = state.parentId || 0;

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
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="deptLoading || userLoading"
    :title="$t('zen.service.dept.create')"
    class="w-11/12 md:w-1/2 2xl:w-1/3"
    draggable
  >
    <OptForm ref="optFormRef" v-model="formState" :dept-list :user-list />
  </Modal>
</template>
