<script setup lang="ts">
import type { DictApi } from '#/api';

import { Icon } from '@vben/icons';

import { useDebounceFn } from '@vueuse/core';

import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { translateState } from '#/utils';

interface Props {
  visible?: boolean;
}

interface Emits {
  (e: 'query', data: DictApi.TypePageQuery): void;
}

withDefaults(defineProps<Props>(), { visible: true });
const emit = defineEmits<Emits>();

const dictStore = useDictStore();

const formState = ref<DictApi.TypePageQuery>({});

const statusOpts = computed(() =>
  dictStore.getDictDataList(DictTypeEnum.STATUS),
);

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
            :label="$t('zen.service.dict.name')"
            class="col-[span_24_/_span_24] !mb-0 lg:col-span-8 xl:col-span-4"
          >
            <ElInput
              v-model="formState.name"
              :placeholder="$t('zen.common.pleaseInput')"
              clearable
            />
          </ElFormItem>

          <ElFormItem
            :label="$t('zen.service.dict.type')"
            class="col-[span_24_/_span_24] !mb-0 lg:col-span-8 xl:col-span-4"
          >
            <ElInput
              v-model="formState.type"
              :placeholder="$t('zen.common.pleaseInput')"
              clearable
            />
          </ElFormItem>

          <ElFormItem
            :label="$t('zen.service.dict.status')"
            class="col-[span_24_/_span_24] !mb-0 lg:col-span-8 xl:col-span-4"
          >
            <ElSelect v-model="formState.status" clearable>
              <ElOption
                v-for="item in statusOpts"
                :key="item.value"
                :label="item.label"
                :value="+item.value"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem
            :label="$t('zen.common.createTime')"
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
