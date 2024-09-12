<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import type { RawEditorSettings } from 'tinymce';

import { type NoticeApi } from '#/api';
import { Tinymce } from '#/components';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

defineExpose({
  getFormInstance,
});

const state = defineModel<Partial<NoticeApi.AddModel>>('modelValue', {
  required: true,
});

const dictStore = useDictStore();
const formRef = ref<FormInstance>();

const typeOpts = computed(() =>
  dictStore.getDictDataList(DictTypeEnum.NOTICE_TYPE),
);

const statusOpts = computed(() =>
  dictStore.getDictDataList(DictTypeEnum.STATUS),
);

const rules = computed<FormRules<NoticeApi.AddModel>>(() => ({
  content: [
    {
      message: t($t('zen.service.notice.content')),
      required: true,
      trigger: 'blur',
    },
  ],
  status: [
    {
      message: t($t('zen.service.notice.status')),
      required: true,
      trigger: 'blur',
    },
  ],
  title: [
    {
      message: t($t('zen.service.notice.title')),
      required: true,
      trigger: 'blur',
    },
  ],
}));

const tinymceOpts = computed<RawEditorSettings>(() => ({
  menubar: false,
  placeholder: $t('zen.common.pleaseInput'),
}));

function t(prefix: string) {
  return `${prefix}${$t('zen.common.joinNotEmypt')}`;
}

function getFormInstance() {
  return formRef.value;
}
</script>

<template>
  <ElForm ref="formRef" :model="state" :rules>
    <ElRow :gutter="20">
      <ElCol :xs="24">
        <ElFormItem
          :label="$t('zen.service.notice.title')"
          prop="title"
          required
        >
          <ElInput
            v-model="state.title"
            :placeholder="$t('zen.common.pleaseInput')"
            clearable
          />
        </ElFormItem>
      </ElCol>

      <ElCol :lg="12" :xs="24">
        <ElFormItem :label="$t('zen.service.notice.type')" prop="type" required>
          <ElSelect v-model="state.type">
            <ElOption
              v-for="item in typeOpts"
              :key="item.value"
              :label="item.label"
              :value="+item.value"
            />
          </ElSelect>
        </ElFormItem>
      </ElCol>

      <ElCol :lg="12" :xs="24">
        <ElFormItem :label="$t('zen.service.notice.status')">
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
        <ElFormItem
          :label="$t('zen.service.notice.content')"
          label-position="top"
          prop="content"
          required
        >
          <!-- <ElInput
            v-model="state.content"
            :autosize="{ minRows: 5, maxRows: 5 }"
            :placeholder="$t('zen.common.pleaseInput')"
            resize="none"
            type="textarea"
          /> -->
          <Tinymce
            v-model="state.content"
            :options="tinymceOpts"
            width="100%"
          />
        </ElFormItem>
      </ElCol>
    </ElRow>
  </ElForm>
</template>
