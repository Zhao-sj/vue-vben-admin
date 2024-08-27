<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

import {
  type BaseSimple,
  buildMenuTree,
  type DeptApi,
  type UserApi,
} from '#/api';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

interface Props {
  deptList?: DeptApi.Simple[];
  postList?: BaseSimple[];
  edit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  deptList: () => [],
  postList: () => [],
});

defineExpose({
  getFormInstance,
});

const state = defineModel<Partial<UserApi.AddModel>>('modelValue', {
  required: true,
});

const treeMapConf = {
  label: 'name',
  children: 'children',
};

const dictStore = useDictStore();
const formRef = ref<FormInstance>();

const deptTree = computed(() => buildMenuTree(props.deptList));

const sexList = computed(() => dictStore.getDictDataList(DictTypeEnum.SEX));

const rules = computed<FormRules<UserApi.AddModel>>(() => ({
  nickname: [
    {
      message: t($t('zen.service.user.nickname')),
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
  return `${prefix}${$t('zen.common.joinNotEmypt')}`;
}

function getFormInstance() {
  return formRef.value;
}
</script>

<template>
  <ElForm ref="formRef" :label-width="80" :model="state" :rules>
    <ElRow :gutter="20">
      <ElCol :lg="12" :xs="24">
        <ElFormItem
          :label="$t('zen.service.user.nickname')"
          prop="nickname"
          required
        >
          <ElInput
            v-model="state.nickname"
            :placeholder="$t('zen.common.pleaseInput')"
            clearable
          />
        </ElFormItem>
      </ElCol>

      <ElCol :lg="12" :xs="24">
        <ElFormItem :label="$t('zen.service.user.deptName')" prop="deptId">
          <ElTreeSelect
            v-model="state.deptId"
            :current-node-key="state.deptId"
            :data="deptTree"
            :expand-on-click-node="false"
            :props="treeMapConf"
            check-strictly
            clearable
            node-key="id"
          />
        </ElFormItem>
      </ElCol>

      <ElCol :lg="12" :xs="24">
        <ElFormItem :label="$t('zen.service.user.mobile')" prop="mobile">
          <ElInput
            v-model="state.mobile"
            :placeholder="$t('zen.common.pleaseInput')"
            clearable
          />
        </ElFormItem>
      </ElCol>

      <ElCol :lg="12" :xs="24">
        <ElFormItem :label="$t('zen.service.user.email')" prop="email">
          <ElInput
            v-model="state.email"
            :placeholder="$t('zen.common.pleaseInput')"
            clearable
          />
        </ElFormItem>
      </ElCol>

      <ElCol :lg="12" :xs="24">
        <ElFormItem
          :label="$t('zen.service.user.username')"
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
          :label="$t('zen.service.user.password')"
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
        <ElFormItem :label="$t('zen.service.user.sex')" prop="sex">
          <ElSelect v-model="state.sex" clearable>
            <ElOption
              v-for="item in sexList"
              :key="item.value"
              :label="item.label"
              :value="+item.value"
            />
          </ElSelect>
        </ElFormItem>
      </ElCol>

      <ElCol :lg="12" :xs="24">
        <ElFormItem :label="$t('zen.service.user.post')" prop="postIds">
          <ElSelect v-model="state.postIds" clearable multiple>
            <ElOption
              v-for="item in postList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </ElSelect>
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
