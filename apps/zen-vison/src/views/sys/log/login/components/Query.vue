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
        <div class="grid grid-cols-[repeat(24,minmax(0,_1fr))] gap-3">
          <ElFormItem
            :label="$t('zen.service.log.common.ip')"
            class="col-[span_24_/_span_24] !mb-0 lg:col-span-8 xl:col-span-4"
          >
            <ElInput
              v-model="formState.ip"
              :placeholder="$t('zen.common.pleaseInput')"
              clearable
            />
          </ElFormItem>

          <ElFormItem
            :label="$t('zen.service.log.login.username')"
            class="col-[span_24_/_span_24] !mb-0 lg:col-span-8 xl:col-span-4"
          >
            <ElInput
              v-model="formState.username"
              :placeholder="$t('zen.common.pleaseInput')"
              clearable
            />
          </ElFormItem>

          <ElFormItem
            :label="$t('zen.service.log.login.result')"
            class="col-[span_24_/_span_24] !mb-0 lg:col-span-8 xl:col-span-4"
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

          <ElFormItem
            :label="$t('zen.service.log.login.createTime')"
            class="col-[span_24_/_span_24] !mb-0 lg:col-span-8 xl:col-span-5"
          >
            <ElDatePicker
              v-model="formState.createTime"
              :end-placeholder="$t('zen.common.endDate')"
              :start-placeholder="$t('zen.common.startDate')"
              type="daterange"
            />
          </ElFormItem>

          <ElFormItem
            class="col-[span_24_/_span_24] !mb-0 lg:col-span-6 xl:col-span-3"
          >
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
        </div>
      </ElForm>
    </div>
  </ElCollapseTransition>
</template>
