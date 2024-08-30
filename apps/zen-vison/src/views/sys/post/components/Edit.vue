<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { omit } from 'lodash-es';

import { getPostApi, type PostApi, updatePostApi } from '#/api';
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
const formState = ref<Partial<PostApi.UpdateModel>>({});

const { loading: postLoading, runAsync: getPost } = useRequest(
  getPostApi,
  requestConf,
);

const { loading, runAsync } = useRequest(updatePostApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

const formInstance = computed(() => optFormRef.value?.getFormInstance());

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    formState.value = {};
    return;
  }

  const { id } = modal.getData();
  if (id) {
    const role = await getPost(id);
    const ignoreKeys = ['createTime'];
    const data = omit(role, ignoreKeys) as PostApi.UpdateModel;
    formState.value = data;
  }
}

function onConfirm() {
  formInstance.value?.validate(async (valid) => {
    if (valid) {
      await runAsync(formState.value as PostApi.UpdateModel);
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
    :loading="postLoading"
    :title="$t('zen.service.post.edit')"
    class="w-11/12 lg:w-1/3 2xl:w-1/4"
    draggable
  >
    <OptForm ref="optFormRef" v-model="formState" />
  </Modal>
</template>
