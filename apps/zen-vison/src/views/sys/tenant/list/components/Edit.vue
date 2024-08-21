<script setup lang="ts">
import { omit } from 'lodash-es';

import { type BaseSimple, type TenantApi, updateTenantApi } from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

import OptForm from './OptForm.vue';

interface Props {
  data?: TenantApi.Tenant;
  packages?: BaseSimple[];
}

interface Emits {
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const modelValue = defineModel<boolean>('modelValue');

const optFormRef = ref<InstanceType<typeof OptForm>>();
const formState = ref<Partial<TenantApi.UpdateModel>>({});

const { loading, runAsync } = useRequest(updateTenantApi, {
  loadingDelay: 200,
  manual: true,
});

const formInstance = computed(() => optFormRef.value?.getFormInstance());

function handleOpen() {
  const ignoreKeys = ['createTime'];
  if (props.data) {
    formState.value = omit(props.data, ignoreKeys) as TenantApi.UpdateModel;
  }
}

function handleSumit() {
  formInstance.value?.validate(async (valid) => {
    if (valid) {
      await runAsync(formState.value as TenantApi.UpdateModel);
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
    :title="$t('zen.service.tenant.edit')"
    class="!w-11/12 md:!w-1/2 2xl:!w-1/3"
    draggable
    width="auto"
    @close="formInstance?.resetFields"
    @open="handleOpen"
  >
    <OptForm ref="optFormRef" v-model="formState" :packages edit />

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
