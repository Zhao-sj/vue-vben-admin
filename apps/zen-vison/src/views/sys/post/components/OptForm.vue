<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

import { type PostApi } from '#/api';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

defineExpose({
  getFormInstance,
});

const state = defineModel<Partial<PostApi.AddModel>>('modelValue', {
  required: true,
});

const dictStore = useDictStore();
const formRef = ref<FormInstance>();

const status = computed(() => dictStore.getDictDataList(DictTypeEnum.STATUS));

const rules = computed<FormRules<PostApi.AddModel>>(() => ({
  code: [
    {
      message: t($t('zen.service.post.code')),
      required: true,
      trigger: 'blur',
    },
  ],
  name: [
    {
      message: t($t('zen.service.post.name')),
      required: true,
      trigger: 'blur',
    },
  ],
  sort: [
    {
      message: t($t('zen.service.post.sort')),
      required: true,
      trigger: 'blur',
    },
  ],
}));

function t(prefix: string) {
  return `${prefix}${$t('zen.common.joinNotEmypt')}`;
}

function getFormInstance() {
  return formRef.value;
}
</script>

<template>
  <ElForm ref="formRef" :label-width="80" :model="state" :rules>
    <ElRow :gutter="20">
      <ElCol :xs="24">
        <ElFormItem :label="$t('zen.service.post.name')" prop="name" required>
          <ElInput
            v-model="state.name"
            :placeholder="$t('zen.common.pleaseInput')"
            clearable
          />
        </ElFormItem>
      </ElCol>

      <ElCol :xs="24">
        <ElFormItem :label="$t('zen.service.post.code')" prop="code">
          <ElInput
            v-model="state.code"
            :placeholder="$t('zen.common.pleaseInput')"
            clearable
          />
        </ElFormItem>
      </ElCol>

      <ElCol :xs="24">
        <ElFormItem :label="$t('zen.service.post.sort')" prop="sort" required>
          <ElInputNumber
            v-model="state.sort"
            :min="0"
            :placeholder="$t('zen.common.pleaseInput')"
            class="!w-full"
            controls-position="right"
          />
        </ElFormItem>
      </ElCol>

      <ElCol :xs="24">
        <ElFormItem :label="$t('zen.service.post.status')">
          <ElRadioGroup v-model="state.status">
            <ElRadioButton
              v-for="item in status"
              :key="item.value"
              :label="item.label"
              :value="+item.value"
            />
          </ElRadioGroup>
        </ElFormItem>
      </ElCol>

      <ElCol :xs="24">
        <ElFormItem :label="$t('zen.common.remark')">
          <ElInput
            v-model="state.remark"
            :autosize="{ minRows: 2, maxRows: 5 }"
            :placeholder="$t('zen.common.pleaseInput')"
            resize="none"
            type="textarea"
          />
        </ElFormItem>
      </ElCol>
    </ElRow>
  </ElForm>
</template>
