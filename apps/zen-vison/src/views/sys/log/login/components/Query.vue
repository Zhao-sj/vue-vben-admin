<script setup lang="ts">
import type { LogApi } from '#/api';

import { Icon } from '@vben/icons';

import { useDebounceFn } from '@vueuse/core';

import { $t } from '#/locales';
import { translateState } from '#/utils';

interface Props {
  visible?: boolean;
}

interface Emits {
  (e: 'query', data: LogApi.LoginQuery): void;
}

withDefaults(defineProps<Props>(), { visible: true });
const emit = defineEmits<Emits>();

const formState = ref<LogApi.LoginQuery>({});

const statusOpts = computed(() => [
  { label: $t('zen.service.log.login.success'), value: true },
  { label: $t('zen.service.log.login.fail'), value: false },
]);

const handleQuery = useDebounceFn(() => {
  const { state } = translateState(formState);
  emit('query', state);
});

function handleReset() {
  formState.value = {};
  handleQuery();
}
</script>

<template>
  <ElCollapseTransition>
    <div v-show="visible" class="rounded-lg border p-3">
      <ElForm :model="formState">
        <ElRow :gutter="12">
          <ElCol :lg="8" :xl="4" :xs="24">
            <ElFormItem
              :label="$t('zen.service.log.common.ip')"
              class="2xl:!mb-0"
            >
              <ElInput
                v-model="formState.ip"
                :placeholder="$t('zen.common.pleaseInput')"
                clearable
              />
            </ElFormItem>
          </ElCol>

          <ElCol :lg="8" :xl="4" :xs="24">
            <ElFormItem
              :label="$t('zen.service.log.login.username')"
              class="2xl:!mb-0"
            >
              <ElInput
                v-model="formState.username"
                :placeholder="$t('zen.common.pleaseInput')"
                clearable
              />
            </ElFormItem>
          </ElCol>

          <ElCol :lg="8" :xl="4" :xs="24">
            <ElFormItem
              :label="$t('zen.service.log.login.result')"
              class="2xl:!mb-0"
            >
              <ElSelect v-model="formState.status" clearable>
                <ElOption
                  v-for="item in statusOpts"
                  :key="item.label"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>

          <ElCol :lg="8" :xl="5" :xs="24">
            <ElFormItem
              :label="$t('zen.service.log.login.createTime')"
              class="2xl:!mb-0"
            >
              <ElDatePicker
                v-model="formState.createTime"
                :end-placeholder="$t('zen.common.endDate')"
                :start-placeholder="$t('zen.common.startDate')"
                type="daterange"
              />
            </ElFormItem>
          </ElCol>

          <ElCol :lg="8" :xl="3" :xs="24">
            <ElFormItem class="!mb-0">
              <div class="flex gap-3">
                <div class="flex">
                  <ElButton type="primary" @click="handleQuery">
                    <Icon class="mr-1" icon="ep:search" />
                    <span>{{ $t('zen.common.search') }}</span>
                  </ElButton>
                </div>

                <div class="flex">
                  <ElButton @click="handleReset">
                    <Icon class="mr-1" icon="ep:refresh" />
                    <span>{{ $t('zen.common.reset') }}</span>
                  </ElButton>
                </div>
              </div>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </div>
  </ElCollapseTransition>
</template>
