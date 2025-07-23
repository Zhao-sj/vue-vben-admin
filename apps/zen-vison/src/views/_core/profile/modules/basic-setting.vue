<script setup lang="ts">
import type { UserProfileApi } from '#/api';

import { useDebounceFn } from '@vueuse/core';

import { useVbenForm } from '#/adapter/form';
import { updateUserProfileApi } from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

import { useBasicInfoFormSchema } from '../data';

interface Props {
  data: UserProfileApi.UserInfo;
}

interface Emits {
  (e: 'success'): void;
}

const props = defineProps<Props>();

const emit = defineEmits<Emits>();

const { loading, runAsync } = useRequest(updateUserProfileApi, {
  manual: true,
});

const [Form, formApi] = useVbenForm({
  schema: useBasicInfoFormSchema(),
  commonConfig: {
    componentProps: {
      clearable: true,
    },
    labelWidth: 80,
    colon: true,
  },
  showDefaultActions: false,
});

const onInfoUpdate = useDebounceFn(async () => {
  const { valid } = await formApi.validate();
  if (!valid) return;
  const values = await formApi.getValues();
  await runAsync(values as UserProfileApi.UpdateModel);
  ElMessage.success($t('page.success'));
  emit('success');
});

watchEffect(() => {
  formApi.setValues({ ...props.data });
});
</script>

<template>
  <div v-loading="loading" class="xl:w-2/3 2xl:w-1/2">
    <Form />

    <div class="text-right">
      <ElButton type="primary" @click="onInfoUpdate">
        {{ $t('profile.basic.submit') }}
      </ElButton>
    </div>
  </div>
</template>
