<script setup lang="ts">
import { useVbenForm } from '#/adapter/form';
import { updateUserPasswordApi } from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { encryptBySha256 } from '#/utils';

import { useSecurityFormSchema } from '../data';

interface Emits {
  (e: 'success'): void;
}

const emit = defineEmits<Emits>();

const { loading, runAsync } = useRequest(updateUserPasswordApi, {
  manual: true,
});

const [Form, formApi] = useVbenForm({
  schema: useSecurityFormSchema(onConfirmValid),
  commonConfig: {
    componentProps: {
      type: 'password',
      showPassword: true,
      clearable: true,
    },
    labelWidth: 92,
    colon: true,
  },
  showDefaultActions: false,
});

async function onConfirmValid(confirmPassword: string) {
  const values = await formApi.getValues();
  const newPassword = values.newPassword;
  if (!newPassword) return true;
  return confirmPassword === values.newPassword;
}

async function onSubmit() {
  const { valid } = await formApi.validate();
  if (!valid) return;
  const values = await formApi.getValues();
  await runAsync({
    oldPassword: encryptBySha256(values.oldPassword),
    newPassword: encryptBySha256(values.newPassword),
  });
  ElMessage.success($t('page.success'));
  emit('success');
}
</script>

<template>
  <div v-loading="loading" class="xl:w-2/3 2xl:w-1/2">
    <Form />

    <div class="text-right">
      <ElButton type="primary" @click="onSubmit">
        {{ $t('profile.security.submit') }}
      </ElButton>
    </div>
  </div>
</template>
