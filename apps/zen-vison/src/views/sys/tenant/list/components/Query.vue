<script setup lang="ts">
import type { TenantApi } from '#/api';

import { Icon } from '@vben/icons';

import { useDebounceFn } from '@vueuse/core';

import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { translateState } from '#/utils';

interface Emits {
  (e: 'query', data: TenantApi.PageQuery): void;
}

const emit = defineEmits<Emits>();

const dictStore = useDictStore();

const formState = ref<TenantApi.PageQuery>({});

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
  <ElForm :model="formState">
    <ElRow :gutter="12">
      <ElCol :lg="6" :xl="4" :xs="24">
        <ElFormItem :label="$t('zen.service.tenant.name')" class="2xl:!mb-0">
          <ElInput
            v-model="formState.name"
            :placeholder="$t('zen.common.pleaseInput')"
            clearable
          />
        </ElFormItem>
      </ElCol>

      <ElCol :lg="6" :xl="4" :xs="24">
        <ElFormItem :label="$t('zen.service.tenant.status')" class="2xl:!mb-0">
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

      <ElCol :lg="6" :xl="4" :xs="24">
        <ElFormItem :label="$t('zen.service.tenant.contact')" class="2xl:!mb-0">
          <ElInput
            v-model="formState.contactName"
            :placeholder="$t('zen.common.pleaseInput')"
            clearable
          />
        </ElFormItem>
      </ElCol>

      <ElCol :lg="6" :xl="4" :xs="24">
        <ElFormItem
          :label="$t('zen.service.tenant.contactPhone')"
          class="2xl:!mb-0"
        >
          <ElInput
            v-model="formState.contactMobile"
            :placeholder="$t('zen.common.pleaseInput')"
            clearable
          />
        </ElFormItem>
      </ElCol>

      <ElCol :lg="8" :xl="5" :xs="24">
        <ElFormItem
          :label="$t('zen.service.tenant.createTime')"
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

      <ElCol :lg="6" :xl="3" :xs="24">
        <ElFormItem class="!mb-0">
          <ElButton type="primary" @click="handleQuery">
            <Icon class="mr-1" icon="ep:search" />
            <span>{{ $t('zen.common.search') }}</span>
          </ElButton>

          <ElButton @click="handleReset">
            <Icon class="mr-1" icon="ep:refresh" />
            <span>{{ $t('zen.common.reset') }}</span>
          </ElButton>
        </ElFormItem>
      </ElCol>
    </ElRow>
  </ElForm>
</template>
