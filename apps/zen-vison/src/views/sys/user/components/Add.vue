<script setup lang="ts">
import { cloneDeep } from 'lodash-es';

import { addUserApi, type BaseSimple, type DeptApi, type UserApi } from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { encryptBySha256 } from '#/utils';

import OptForm from './OptForm.vue';

interface Props {
  deptList?: DeptApi.Simple[];
  postList?: BaseSimple[];
}

interface Emits {
  (e: 'success'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const modelValue = defineModel<boolean>('modelValue');

const defaultState = {};
const optFormRef = ref<InstanceType<typeof OptForm>>();
const formState = ref<Partial<UserApi.AddModel>>(cloneDeep(defaultState));

const { loading, runAsync } = useRequest(addUserApi, {
  loadingDelay: 200,
  manual: true,
});

const formInstance = computed(() => optFormRef.value?.getFormInstance());

function handleClose() {
  formState.value = cloneDeep(defaultState);
}

function handleSubmit() {
  formInstance.value?.validate(async (valid) => {
    if (valid) {
      const state = cloneDeep(formState.value as UserApi.AddModel);
      state.password = encryptBySha256(state.password);

      await runAsync(state);
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
    :title="$t('zen.service.user.create')"
    class="!w-11/12 md:!w-1/2 2xl:!w-1/3"
    destroy-on-close
    draggable
    width="auto"
    @close="handleClose"
  >
    <OptForm ref="optFormRef" v-model="formState" :dept-list :post-list />

    <template #footer>
      <ElButton @click="modelValue = false">
        {{ $t('zen.common.cancel') }}
      </ElButton>
      <ElButton :loading type="primary" @click="handleSubmit">
        {{ $t('zen.common.confirm') }}
      </ElButton>
    </template>
  </ElDialog>
</template>
