<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

import type { BaseSimple, TenantApi } from '#/api';

import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

interface Props {
  packages?: BaseSimple[];
  edit?: boolean;
}

withDefaults(defineProps<Props>(), {
  packages: () => [],
});

defineExpose({
  getFormInstance,
});

const state = defineModel<Partial<TenantApi.AddModel>>('modelValue', {
  required: true,
});

const dictStore = useDictStore();
const formRef = ref<FormInstance>();

const status = computed(() => dictStore.getDictDataList(DictTypeEnum.STATUS));

const rules = computed<FormRules<TenantApi.AddModel>>(() => ({
  accountCount: [
    {
      message: t($t('zen.service.tenant.accountLimit')),
      required: true,
      trigger: 'blur',
    },
  ],
  contactMobile: [
    {
      message: t($t('zen.service.tenant.contactPhone')),
      required: true,
      trigger: 'blur',
    },
  ],
  contactName: [
    {
      message: t($t('zen.service.tenant.contact')),
      required: true,
      trigger: 'blur',
    },
  ],
  expireTime: [
    {
      message: t($t('zen.service.tenant.expireTime')),
      required: true,
      trigger: 'blur',
    },
  ],
  name: [
    {
      message: t($t('zen.service.tenant.name')),
      required: true,
      trigger: 'blur',
    },
  ],
  packageId: [
    {
      message: t($t('zen.service.tenant.package')),
      required: true,
      trigger: 'blur',
    },
  ],
  password: [
    {
      message: t($t('zen.service.tenant.password')),
      required: true,
      trigger: 'blur',
    },
  ],
  username: [
    {
      message: t($t('zen.service.tenant.username')),
      required: true,
      trigger: 'blur',
    },
  ],
}));

function t(prefix: string) {
  return `${prefix}${$t('zen.common.notEmypt')}`;
}

function getFormInstance() {
  return formRef.value;
}
</script>

<template>
  <ElForm ref="formRef" :label-width="80" :model="state" :rules>
    <ElRow :gutter="20">
      <ElCol :lg="12" :xs="24">
        <ElFormItem :label="$t('zen.service.tenant.name')" prop="name" required>
          <ElInput
            v-model="state.name"
            :placeholder="$t('zen.common.pleaseInput')"
            clearable
          />
        </ElFormItem>
      </ElCol>

      <ElCol :lg="12" :xs="24">
        <ElFormItem
          :label="$t('zen.service.tenant.package')"
          prop="packageId"
          required
        >
          <ElSelect v-model="state.packageId">
            <ElOption
              v-for="item in packages"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </ElSelect>
        </ElFormItem>
      </ElCol>

      <ElCol :lg="12" :xs="24">
        <ElFormItem
          :label="$t('zen.service.tenant.contact')"
          prop="contactName"
          required
        >
          <ElInput
            v-model="state.contactName"
            :placeholder="$t('zen.common.pleaseInput')"
            clearable
          />
        </ElFormItem>
      </ElCol>

      <ElCol :lg="12" :xs="24">
        <ElFormItem
          :label="$t('zen.service.tenant.contactPhone')"
          prop="contactMobile"
          required
        >
          <ElInput
            v-model="state.contactMobile"
            :placeholder="$t('zen.common.pleaseInput')"
            clearable
          />
        </ElFormItem>
      </ElCol>

      <ElCol v-if="!edit" :lg="12" :xs="24">
        <ElFormItem
          :label="$t('zen.service.tenant.username')"
          prop="username"
          required
        >
          <ElInput
            v-model="state.username"
            :placeholder="$t('zen.common.pleaseInput')"
            clearable
          />
        </ElFormItem>
      </ElCol>

      <ElCol v-if="!edit" :lg="12" :xs="24">
        <ElFormItem
          :label="$t('zen.service.tenant.password')"
          prop="password"
          required
        >
          <ElInput
            v-model="state.password"
            :placeholder="$t('zen.common.pleaseInput')"
            show-password
            type="password"
          />
        </ElFormItem>
      </ElCol>

      <ElCol :lg="12" :xs="24">
        <ElFormItem
          :label="$t('zen.service.tenant.accountLimit')"
          prop="accountCount"
          required
        >
          <ElInputNumber
            v-model="state.accountCount"
            :min="1"
            :placeholder="$t('zen.common.pleaseInput')"
            class="!w-full"
            controls-position="right"
          />
        </ElFormItem>
      </ElCol>

      <ElCol :lg="12" :xs="24">
        <ElFormItem
          :label="$t('zen.service.tenant.expireTime')"
          prop="expireTime"
          required
        >
          <ElDatePicker
            v-model="state.expireTime"
            :placeholder="$t('zen.common.pleaseSelect')"
            class="!w-full"
            type="datetime"
          />
        </ElFormItem>
      </ElCol>

      <ElCol :lg="12" :xs="24">
        <ElFormItem :label="$t('zen.service.tenant.website')">
          <ElInput
            v-model="state.website"
            :placeholder="$t('zen.common.pleaseInput')"
            clearable
          />
        </ElFormItem>
      </ElCol>

      <ElCol :lg="12" :xs="24">
        <ElFormItem :label="$t('zen.service.tenant.status')">
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
    </ElRow>
  </ElForm>
</template>
