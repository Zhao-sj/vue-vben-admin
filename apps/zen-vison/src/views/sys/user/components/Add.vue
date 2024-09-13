<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { cloneDeep } from 'lodash-es';

import {
  addUserApi,
  getDeptSimpleListApi,
  getPostSimpleListApi,
  type UserApi,
} from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { encryptBySha256 } from '#/utils';

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
const formState = ref<Partial<UserApi.AddModel>>(cloneDeep(defaultState));

const {
  data: deptList,
  loading: deptLoading,
  runAsync: getDept,
} = useRequest(getDeptSimpleListApi, requestConf);

const {
  data: postList,
  loading: postLoading,
  runAsync: getPost,
} = useRequest(getPostSimpleListApi, requestConf);

const { loading, runAsync } = useRequest(addUserApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

const formInstance = computed(() => optFormRef.value?.getFormInstance());

async function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    await Promise.all([getDept(), getPost()]);
    return;
  }

  formState.value = cloneDeep(defaultState);
}

function onConfirm() {
  formInstance.value?.validate(async (valid) => {
    if (valid) {
      const state = cloneDeep(formState.value as UserApi.AddModel);
      state.password = encryptBySha256(state.password);

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
    :loading="deptLoading || postLoading"
    :title="$t('zen.service.user.create')"
    class="w-11/12 md:w-1/2 2xl:w-1/3"
    draggable
  >
    <OptForm ref="optFormRef" v-model="formState" :dept-list :post-list />
  </Modal>
</template>
