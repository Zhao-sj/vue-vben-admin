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
  (e: 'query', data: LogApi.AccessQuery): void;
}

withDefaults(defineProps<Props>(), { visible: true });
const emit = defineEmits<Emits>();

const dictStore = useDictStore();
const formState = ref<LogApi.AccessQuery>({});

const userTypeOpts = computed(() =>
  dictStore.getDictDataList(DictTypeEnum.USER_TYPE),
);

const handleQuery = useDebounceFn(() => {
  const { state } = translateState({ createTime: formState.value.beginTime });
  const cloneState = cloneDeep(formState.value);
  cloneState.beginTime = state.createTime;
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
        <ElRow :gutter="12">
          <ElCol :lg="8" :xl="4" :xs="24">
            <ElFormItem
              :label="$t('zen.service.log.common.userId')"
              class="2xl:!mb-0"
            >
              <ElInput
                v-model="formState.userId"
                :placeholder="$t('zen.common.pleaseInput')"
                clearable
              />
            </ElFormItem>
          </ElCol>

          <ElCol :lg="8" :xl="4" :xs="24">
            <ElFormItem
              :label="$t('zen.service.log.common.userType')"
              class="2xl:!mb-0"
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
          </ElCol>

          <ElCol v-if="false" :lg="8" :xl="4" :xs="24">
            <ElFormItem
              :label="$t('zen.service.log.common.appName')"
              class="2xl:!mb-0"
            >
              <ElInput
                v-model="formState.appName"
                :placeholder="$t('zen.common.pleaseInput')"
                clearable
              />
            </ElFormItem>
          </ElCol>

          <ElCol :lg="8" :xl="4" :xs="24">
            <ElFormItem
              :label="$t('zen.service.log.common.requestUrl')"
              class="2xl:!mb-0"
            >
              <ElInput
                v-model="formState.requestUrl"
                :placeholder="$t('zen.common.pleaseInput')"
                clearable
              />
            </ElFormItem>
          </ElCol>

          <ElCol :lg="8" :xl="5" :xs="24">
            <ElFormItem
              :label="$t('zen.service.log.access.createTime')"
              class="2xl:!mb-0"
            >
              <ElDatePicker
                v-model="formState.beginTime"
                :end-placeholder="$t('zen.common.endDate')"
                :start-placeholder="$t('zen.common.startDate')"
                type="daterange"
              />
            </ElFormItem>
          </ElCol>

          <ElCol :lg="8" :xl="4" :xs="24">
            <ElFormItem :label="$t('zen.service.log.access.duration')">
              <ElInputNumber
                v-model="formState.duration"
                :min="1"
                :placeholder="$t('zen.common.pleaseInput')"
                class="!w-full"
                controls-position="right"
              />
            </ElFormItem>
          </ElCol>

          <ElCol :lg="8" :xl="4" :xs="24">
            <ElFormItem
              :label="$t('zen.service.log.access.resultCode')"
              class="2xl:!mb-0"
            >
              <ElInput
                v-model="formState.resultCode"
                :placeholder="$t('zen.common.pleaseInput')"
                clearable
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
