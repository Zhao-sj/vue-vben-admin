<script setup lang="ts">
import { omit } from 'lodash-es';

import {
  type BaseSimple,
  type DeptApi,
  updateUserApi,
  type UserApi,
} from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

import OptForm from './OptForm.vue';

interface Props {
  data?: UserApi.User;
  deptList?: DeptApi.Simple[];
  postList?: BaseSimple[];
}

interface Emits {
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const modelValue = defineModel<boolean>('modelValue');

const optFormRef = ref<InstanceType<typeof OptForm>>();
const formState = ref<Partial<UserApi.UpdateModel>>({});

const { loading, runAsync } = useRequest(updateUserApi, {
  loadingDelay: 200,
  manual: true,
});

const formInstance = computed(() => optFormRef.value?.getFormInstance());

function handleOpen() {
  const ignoreKeys = [
    'createTime',
    'loginDate',
    'loginIp',
    'status',
    'avatar',
    'deptName',
  ];
  if (props.data) {
    const data = omit(props.data, ignoreKeys) as UserApi.UpdateModel;
    if (!data.postIds) {
      data.postIds = [];
    }
    formState.value = data;
  }
}

function handleSumit() {
  formInstance.value?.validate(async (valid) => {
    if (valid) {
      await runAsync(formState.value as UserApi.UpdateModel);
      ElMessage.success($t('zen.common.successTip'));
      modelValue.value = false;
      emit('success');
    }
  });
}
</script>

<template>
  <ElDialog
    v-model="modelValue"
    :close-on-click-modal="false"
    :title="$t('zen.service.user.edit')"
    class="!w-11/12 md:!w-1/2 2xl:!w-1/3"
    destroy-on-close
    draggable
    width="auto"
    @open="handleOpen"
  >
    <OptForm ref="optFormRef" v-model="formState" :dept-list :post-list edit />

    <template #footer>
      <ElButton @click="modelValue = false">
        {{ $t('zen.common.cancel') }}
      </ElButton>
      <ElButton :loading type="primary" @click="handleSumit">
        {{ $t('zen.common.confirm') }}
      </ElButton>
    </template>
  </ElDialog>
</template>
