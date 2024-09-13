<script setup lang="ts">
import type { MenuApi } from '#/api';

import { Icon } from '@vben/icons';

import { useDebounceFn } from '@vueuse/core';

import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

interface Props {
  visible?: boolean;
}

interface Emits {
  (e: 'query', data: MenuApi.Query): void;
}

withDefaults(defineProps<Props>(), { visible: true });
const emit = defineEmits<Emits>();

const dictStore = useDictStore();

const formState = ref<MenuApi.Query>({});

const statusOpts = computed(() =>
  dictStore.getDictDataList(DictTypeEnum.STATUS),
);

const handleQuery = useDebounceFn(() => {
  emit('query', formState.value);
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
            :label="$t('zen.service.dept.name')"
            class="col-[span_24_/_span_24] !mb-0 lg:col-span-6 xl:col-span-4"
          >
            <ElInput
              v-model="formState.name"
              :placeholder="$t('zen.common.pleaseInput')"
              clearable
            />
          </ElFormItem>

          <ElFormItem
            :label="$t('zen.service.dept.status')"
            class="col-[span_24_/_span_24] !mb-0 lg:col-span-6 xl:col-span-4"
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
