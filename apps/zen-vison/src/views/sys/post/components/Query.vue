<script setup lang="ts">
import type { PostApi } from '#/api';

import { Icon } from '@vben/icons';

import { useDebounceFn } from '@vueuse/core';

import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

interface Props {
  visible?: boolean;
}

interface Emits {
  (e: 'query', data: PostApi.PageQuery): void;
}

withDefaults(defineProps<Props>(), { visible: true });
const emit = defineEmits<Emits>();

const dictStore = useDictStore();

const formState = ref<PostApi.PageQuery>({});

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
        <ElRow :gutter="12">
          <ElCol :lg="8" :xl="4" :xs="24">
            <ElFormItem :label="$t('zen.service.post.code')" class="2xl:!mb-0">
              <ElInput
                v-model="formState.code"
                :placeholder="$t('zen.common.pleaseInput')"
                clearable
              />
            </ElFormItem>
          </ElCol>

          <ElCol :lg="8" :xl="4" :xs="24">
            <ElFormItem :label="$t('zen.service.post.name')" class="2xl:!mb-0">
              <ElInput
                v-model="formState.name"
                :placeholder="$t('zen.common.pleaseInput')"
                clearable
              />
            </ElFormItem>
          </ElCol>

          <ElCol :lg="8" :xl="4" :xs="24">
            <ElFormItem
              :label="$t('zen.service.post.status')"
              class="2xl:!mb-0"
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
