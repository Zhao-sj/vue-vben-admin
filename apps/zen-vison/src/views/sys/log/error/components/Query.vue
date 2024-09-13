<script setup lang="ts">
import type { LogApi } from '#/api';

import { Icon } from '@vben/icons';

import { useDebounceFn } from '@vueuse/core';
import { cloneDeep } from 'lodash-es';

import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { translateState } from '#/utils';

interface Props {
  visible?: boolean;
}

interface Emits {
  (e: 'query', data: LogApi.ErrorQuery): void;
}

withDefaults(defineProps<Props>(), { visible: true });
const emit = defineEmits<Emits>();

const dictStore = useDictStore();
const formState = ref<LogApi.ErrorQuery>({});

const userTypeOpts = computed(() =>
  dictStore.getDictDataList(DictTypeEnum.USER_TYPE),
);

const ProcessOpts = computed(() =>
  dictStore.getDictDataList(DictTypeEnum.ERROR_LOG_PROCESS_STATUS),
);

const handleQuery = useDebounceFn(() => {
  const { state } = translateState({ createTime: formState.value.exTime });
  const cloneState = cloneDeep(formState.value);
  cloneState.exTime = state.createTime;
  emit('query', cloneState);
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
            v-if="false"
            :label="$t('zen.service.log.common.appName')"
            class="col-[span_24_/_span_24] !mb-0 lg:col-span-8 xl:col-span-4"
          >
            <ElInput
              v-model="formState.appName"
              :placeholder="$t('zen.common.pleaseInput')"
              clearable
            />
          </ElFormItem>

          <ElFormItem
            :label="$t('zen.service.log.common.userId')"
            class="col-[span_24_/_span_24] !mb-0 lg:col-span-8 xl:col-span-4"
          >
            <ElInput
              v-model="formState.userId"
              :placeholder="$t('zen.common.pleaseInput')"
              clearable
            />
          </ElFormItem>

          <ElFormItem
            :label="$t('zen.service.log.common.userType')"
            class="col-[span_24_/_span_24] !mb-0 lg:col-span-8 xl:col-span-4"
          >
            <ElSelect v-model="formState.userType" clearable>
              <ElOption
                v-for="item in userTypeOpts"
                :key="item.value"
                :label="item.label"
                :value="+item.value"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem
            :label="$t('zen.service.log.common.requestUrl')"
            class="col-[span_24_/_span_24] !mb-0 lg:col-span-8 xl:col-span-4"
          >
            <ElInput
              v-model="formState.requestUrl"
              :placeholder="$t('zen.common.pleaseInput')"
              clearable
            />
          </ElFormItem>

          <ElFormItem
            :label="$t('zen.service.log.error.exTime')"
            class="col-[span_24_/_span_24] !mb-0 lg:col-span-8 xl:col-span-5"
          >
            <ElDatePicker
              v-model="formState.exTime"
              :end-placeholder="$t('zen.common.endDate')"
              :start-placeholder="$t('zen.common.startDate')"
              type="daterange"
            />
          </ElFormItem>

          <ElFormItem
            :label="$t('zen.service.log.error.status')"
            class="col-[span_24_/_span_24] !mb-0 lg:col-span-8 xl:col-span-4"
          >
            <ElSelect v-model="formState.processStatus" clearable>
              <ElOption
                v-for="item in ProcessOpts"
                :key="item.value"
                :label="item.label"
                :value="+item.value"
              />
            </ElSelect>
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
