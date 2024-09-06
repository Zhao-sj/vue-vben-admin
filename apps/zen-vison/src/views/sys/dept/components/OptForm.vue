<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

import { buildMenuTree, type DeptApi, type UserApi } from '#/api';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

interface Props {
  deptList?: DeptApi.Simple[];
  userList?: UserApi.Simple[];
}

const props = withDefaults(defineProps<Props>(), {
  deptList: () => [],
  userList: () => [],
});

defineExpose({
  getFormInstance,
});

const dictStore = useDictStore();
const formRef = ref<FormInstance>();

const treeMapConf = {
  label: 'name',
  children: 'children',
};

const formState = defineModel<Partial<DeptApi.AddModel>>('modelValue', {
  required: true,
});

const statusOpts = computed(() =>
  dictStore.getDictDataList(DictTypeEnum.STATUS),
);

const deptTree = computed(() => buildMenuTree(props.deptList));

const rules = computed<FormRules<DeptApi.AddModel>>(() => ({
  name: [
    {
      message: t($t('zen.service.dept.name')),
      required: true,
      trigger: 'blur',
    },
  ],
  sort: [
    {
      message: t($t('zen.service.dept.sort')),
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
  <ElForm ref="formRef" :label-width="80" :model="formState" :rules>
    <ElRow :gutter="20">
      <ElCol :xs="24">
        <ElFormItem :label="$t('zen.service.dept.parent')">
          <ElTreeSelect
            v-model="formState.parentId"
            :current-node-key="formState.parentId"
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
        <ElFormItem :label="$t('zen.service.dept.name')" prop="name" required>
          <ElInput
            v-model="formState.name"
            :placeholder="$t('zen.common.pleaseInput')"
            clearable
          />
        </ElFormItem>
      </ElCol>

      <ElCol :lg="12" :xs="24">
        <ElFormItem :label="$t('zen.service.dept.sort')" prop="sort" required>
          <ElInputNumber
            v-model="formState.sort"
            :min="0"
            :placeholder="$t('zen.common.pleaseInput')"
            class="!w-full"
            controls-position="right"
          />
        </ElFormItem>
      </ElCol>

      <ElCol :lg="12" :xs="24">
        <ElFormItem :label="$t('zen.service.dept.leader')">
          <ElSelect v-model="formState.leaderId" clearable>
            <ElOption
              v-for="item in userList"
              :key="item.id"
              :label="item.nickname || item.id"
              :value="item.id"
            />
          </ElSelect>
        </ElFormItem>
      </ElCol>

      <ElCol :lg="12" :xs="24">
        <ElFormItem :label="$t('zen.service.dept.phone')">
          <ElInput
            v-model="formState.phone"
            :placeholder="$t('zen.common.pleaseInput')"
            clearable
          />
        </ElFormItem>
      </ElCol>

      <ElCol :lg="12" :xs="24">
        <ElFormItem :label="$t('zen.service.dept.email')">
          <ElInput
            v-model="formState.email"
            :placeholder="$t('zen.common.pleaseInput')"
            clearable
          />
        </ElFormItem>
      </ElCol>

      <ElCol :lg="12" :xs="24">
        <ElFormItem :label="$t('zen.service.dept.status')" class="!mb-0">
          <ElRadioGroup v-model="formState.status">
            <ElRadioButton
              v-for="item in statusOpts"
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
