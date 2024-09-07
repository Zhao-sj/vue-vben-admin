<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

import { type DictApi } from '#/api';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

interface Props {
  edit?: boolean;
}

defineProps<Props>();

defineExpose({
  getFormInstance,
});

const state = defineModel<Partial<DictApi.TypeAddModel>>('modelValue', {
  required: true,
});

const dictStore = useDictStore();
const formRef = ref<FormInstance>();

const statusOpts = computed(() =>
  dictStore.getDictDataList(DictTypeEnum.STATUS),
);

const rules = computed<FormRules<DictApi.TypeAddModel>>(() => ({
  name: [
    {
      message: t($t('zen.service.dict.name')),
      required: true,
      trigger: 'blur',
    },
  ],
  type: [
    {
      message: t($t('zen.service.dict.type')),
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
        <ElFormItem :label="$t('zen.service.dict.name')" prop="name" required>
          <ElInput
            v-model="state.name"
            :placeholder="$t('zen.common.pleaseInput')"
            clearable
          />
        </ElFormItem>
      </ElCol>

      <ElCol :xs="24">
        <ElFormItem :label="$t('zen.service.dict.type')" prop="type" required>
          <ElInput
            v-model="state.type"
            :disabled="edit"
            :placeholder="$t('zen.common.pleaseInput')"
            clearable
          />
        </ElFormItem>
      </ElCol>

      <ElCol :xs="24">
        <ElFormItem :label="$t('zen.service.dict.status')">
          <ElRadioGroup v-model="state.status">
            <ElRadioButton
              v-for="item in statusOpts"
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
