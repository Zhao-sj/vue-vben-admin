<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

import { type DictApi } from '#/api';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

interface Props {
  type?: string;
}

defineProps<Props>();

defineExpose({
  getFormInstance,
});

const state = defineModel<Partial<DictApi.DataAddModel>>('modelValue', {
  required: true,
});

const dictStore = useDictStore();
const formRef = ref<FormInstance>();

const colorOpts: DictApi.Color[] = [
  'primary',
  'success',
  'info',
  'warning',
  'danger',
];

const statusOpts = computed(() =>
  dictStore.getDictDataList(DictTypeEnum.STATUS),
);

const rules = computed<FormRules<DictApi.DataAddModel>>(() => ({
  label: [
    {
      message: t($t('zen.service.dict.label')),
      required: true,
      trigger: 'blur',
    },
  ],
  sort: [
    {
      message: t($t('zen.service.dict.sort')),
      required: true,
      trigger: 'blur',
    },
  ],
  value: [
    {
      message: t($t('zen.service.dict.value')),
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
        <ElFormItem :label="$t('zen.service.dict.type')">
          <ElInput :model-value="type" disabled />
        </ElFormItem>
      </ElCol>

      <ElCol :xs="24">
        <ElFormItem :label="$t('zen.service.dict.label')" prop="label" required>
          <ElInput
            v-model="state.label"
            :placeholder="$t('zen.common.pleaseInput')"
            clearable
          />
        </ElFormItem>
      </ElCol>

      <ElCol :xs="24">
        <ElFormItem :label="$t('zen.service.dict.value')" prop="value" required>
          <ElInput
            v-model="state.value"
            :placeholder="$t('zen.common.pleaseInput')"
            clearable
          />
        </ElFormItem>
      </ElCol>

      <ElCol :xs="24">
        <ElFormItem :label="$t('zen.service.dict.color')">
          <ElSelect v-model="state.color">
            <ElOption
              v-for="item in colorOpts"
              :key="item"
              :label="item"
              :value="item"
            />
          </ElSelect>
        </ElFormItem>
      </ElCol>

      <ElCol :xs="24">
        <ElFormItem :label="$t('zen.service.dict.sort')" prop="sort" required>
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
