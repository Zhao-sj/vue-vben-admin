<script setup lang="ts">
import { Icon } from '@vben/icons';

import { useDebounceFn } from '@vueuse/core';
import { omit } from 'lodash-es';

import { type DictApi, getDictTypeSimpleListApi } from '#/api';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

interface Props {
  visible?: boolean;
}

interface Emits {
  (e: 'query', data: DictApi.DataPageQuery): void;
}

withDefaults(defineProps<Props>(), { visible: true });
const emit = defineEmits<Emits>();

const { currentRoute } = useRouter();
const dictStore = useDictStore();

const { data: dictTypeList, loading } = useRequest(getDictTypeSimpleListApi);

const formState = ref<DictApi.DataPageQuery>({
  dictTypeId: +currentRoute.value.params.id!,
});

const statusOpts = computed(() =>
  dictStore.getDictDataList(DictTypeEnum.STATUS),
);

const handleQuery = useDebounceFn(() => {
  emit('query', formState.value);
});

function handleReset() {
  const resetKeys: (keyof DictApi.DataPageQuery)[] = ['label', 'status'];
  formState.value = omit(formState.value, resetKeys) as DictApi.DataPageQuery;
  handleQuery();
}
</script>

<template>
  <ElCollapseTransition>
    <div v-show="visible" class="rounded-lg border p-3">
      <ElForm :model="formState">
        <ElRow :gutter="12">
          <ElCol :lg="8" :xl="4" :xs="24">
            <ElFormItem :label="$t('zen.service.dict.name')" class="2xl:!mb-0">
              <ElSelect v-model="formState.dictTypeId" :loading>
                <ElOption
                  v-for="item in dictTypeList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>

          <ElCol :lg="8" :xl="4" :xs="24">
            <ElFormItem :label="$t('zen.service.dict.label')" class="2xl:!mb-0">
              <ElInput
                v-model="formState.label"
                :placeholder="$t('zen.common.pleaseInput')"
                clearable
              />
            </ElFormItem>
          </ElCol>

          <ElCol :lg="8" :xl="4" :xs="24">
            <ElFormItem
              :label="$t('zen.service.dict.status')"
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
