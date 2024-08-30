<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { omit } from 'lodash-es';

import {
  getDeptSimpleListApi,
  getPostSimpleListApi,
  getUserApi,
  updateUserApi,
  type UserApi,
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
const formState = ref<Partial<UserApi.UpdateModel>>({});

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

const { loading: userLoading, runAsync: getUser } = useRequest(
  getUserApi,
  requestConf,
);

const { loading, runAsync } = useRequest(updateUserApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

const formInstance = computed(() => optFormRef.value?.getFormInstance());

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = modal.getData();
  if (id) {
    const [user] = await Promise.all([getUser(id), getDept(), getPost()]);

    const ignoreKeys = [
      'createTime',
      'loginDate',
      'loginIp',
      'status',
      'avatar',
      'deptName',
    ];

    const data = omit(user, ignoreKeys) as UserApi.UpdateModel;
    if (!data.postIds) {
      data.postIds = [];
    }
    formState.value = data;
  }
}

function onConfirm() {
  formInstance.value?.validate(async (valid) => {
    if (valid) {
      await runAsync(formState.value as UserApi.UpdateModel);
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
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :confirm-text="$t('zen.common.confirm')"
    :loading="deptLoading || postLoading || userLoading"
    :title="$t('zen.service.user.edit')"
    class="w-11/12 md:w-1/2 2xl:w-1/3"
    draggable
  >
    <OptForm ref="optFormRef" v-model="formState" :dept-list :post-list edit />
  </Modal>
</template>
