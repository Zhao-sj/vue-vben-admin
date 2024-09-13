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
        <div class="grid grid-cols-[repeat(24,minmax(0,_1fr))] gap-3">
          <ElFormItem
            :label="$t('zen.service.dict.name')"
            class="col-[span_24_/_span_24] !mb-0 lg:col-span-8 xl:col-span-4"
          >
            <ElSelect v-model="formState.dictTypeId" :loading>
              <ElOption
                v-for="item in dictTypeList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem
            :label="$t('zen.service.dict.label')"
            class="col-[span_24_/_span_24] !mb-0 lg:col-span-8 xl:col-span-4"
          >
            <ElInput
              v-model="formState.label"
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
