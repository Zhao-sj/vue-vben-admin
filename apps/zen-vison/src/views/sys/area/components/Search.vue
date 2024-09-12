<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

import { useVbenModal } from '@vben/common-ui';

import { useDebounceFn } from '@vueuse/core';

import { getAreaApi } from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

interface FormState {
  ip?: string;
  location?: string;
}

const formRef = ref<FormInstance>();
const formState = ref<FormState>({});

const { loading, runAsync } = useRequest(getAreaApi, { manual: true });

const [Modal] = useVbenModal({
  onConfirm: useDebounceFn(onConfirm),
  onOpenChange,
});

const rules = computed<FormRules<FormState>>(() => ({
  ip: [
    {
      message: t($t('zen.service.area.ip')),
      required: true,
      trigger: 'blur',
    },
  ],
}));

function t(prefix: string) {
  return `${prefix}${$t('zen.common.joinNotEmypt')}`;
}

function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    formState.value = {};
  }
}

function onConfirm() {
  formRef.value?.validate(async (valid) => {
    if (!valid) return;
    const location = await runAsync(formState.value.ip!);
    formState.value.location = location;
  });
}
</script>

<template>
  <Modal
    :cancel-text="$t('zen.common.cancel')"
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :confirm-text="$t('zen.common.query')"
    :title="$t('zen.service.area.search')"
    class="w-11/12 lg:w-1/3 2xl:w-1/4"
    draggable
  >
    <ElForm ref="formRef" :label-width="80" :model="formState" :rules>
      <ElRow :gutter="20">
        <ElCol :xs="24">
          <ElFormItem :label="$t('zen.service.area.ip')" prop="ip" required>
            <ElInput
              v-model="formState.ip"
              :placeholder="$t('zen.common.pleaseInput')"
              clearable
            />
          </ElFormItem>
        </ElCol>

        <ElCol :xs="24">
          <ElFormItem :label="$t('zen.service.area.address')">
            <ElInput v-model="formState.location" disabled />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
  </Modal>
</template>
