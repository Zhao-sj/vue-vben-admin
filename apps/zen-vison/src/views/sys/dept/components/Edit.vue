<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { cloneDeep, omit } from 'lodash-es';

import {
  type DeptApi,
  getDeptApi,
  getDeptSimpleListApi,
  getUserSimpleListApi,
  updateDeptApi,
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
const formState = ref<Partial<DeptApi.UpdateModel>>({});

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

const { loading: dataLoading, runAsync: getData } = useRequest(
  getDeptApi,
  requestConf,
);

const { loading, runAsync } = useRequest(updateDeptApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

const formInstance = computed(() => optFormRef.value?.getFormInstance());

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = modal.getData();
  if (id) {
    const [dept] = await Promise.all([
      getData(id),
      getDeptList(),
      getUserList(),
    ]);
    const ignoreKeys = ['createTime'];
    formState.value = omit(dept, ignoreKeys) as DeptApi.UpdateModel;
  }
}

function onConfirm() {
  formInstance.value?.validate(async (valid) => {
    if (valid) {
      const state = cloneDeep(formState.value) as DeptApi.UpdateModel;
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
    :loading="deptLoading || userLoading || dataLoading"
    :title="$t('zen.service.dept.edit')"
    class="w-11/12 md:w-1/2 2xl:w-1/3"
    draggable
  >
    <OptForm ref="optFormRef" v-model="formState" :dept-list :user-list />
  </Modal>
</template>
