<script setup lang="ts">
import { ElTree, type FormInstance, type FormRules } from 'element-plus';
import { cloneDeep } from 'lodash-es';

import { buildMenuTree, type MenuApi, type TenantApi } from '#/api';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

interface Props {
  menus?: MenuApi.Simple[];
}

const props = withDefaults(defineProps<Props>(), {
  menus: () => [],
});

defineExpose({
  getFormInstance,
  getTreeInstance,
});

const dictStore = useDictStore();
const formRef = ref<FormInstance>();
const treeRef = ref<InstanceType<typeof ElTree>>();
const isCheckAll = ref(false);

const treeMapConf = {
  label: 'name',
  children: 'children',
};

const state = defineModel<Partial<TenantApi.AddPackageModel>>('modelValue', {
  required: true,
});

const status = computed(() => dictStore.getDictDataList(DictTypeEnum.STATUS));
const menuTree = computed(() => buildMenuTree(cloneDeep(props.menus)));

const rules = computed<FormRules<TenantApi.AddModel>>(() => ({
  name: [
    {
      message: t($t('zen.service.package.name')),
      required: true,
      trigger: 'blur',
    },
  ],
}));

function t(prefix: string) {
  return `${prefix}${$t('zen.common.joinNotEmypt')}`;
}

function handleExpand(checked: boolean | number | string) {
  props.menus.forEach((item) => {
    treeRef.value!.store.nodesMap[item.id]!.expanded = checked as boolean;
  });
}

function handleChooseAll(checked: boolean | number | string) {
  treeRef.value!.setCheckedKeys(
    checked ? props.menus.map((item) => item.id) : [],
  );
}

function getFormInstance() {
  return formRef.value;
}

function getTreeInstance() {
  return treeRef.value;
}

watch(state, ({ menuIds }) => {
  isCheckAll.value = props.menus.every((item) => menuIds?.includes(item.id));
});
</script>

<template>
  <ElForm ref="formRef" :label-width="80" :model="state" :rules>
    <ElRow :gutter="20">
      <ElCol :xs="24">
        <ElFormItem
          :label="$t('zen.service.package.name')"
          prop="name"
          required
        >
          <ElInput
            v-model="state.name"
            :placeholder="$t('zen.common.pleaseInput')"
            clearable
          />
        </ElFormItem>
      </ElCol>

      <ElCol :xs="24">
        <ElFormItem :label="$t('zen.service.package.menu')">
          <div class="w-full">
            <div>
              <ElCheckbox
                :label="`${$t('zen.common.expand')} / ${$t('zen.common.collapsed')}`"
                @change="handleExpand"
              />
              <ElCheckbox
                v-model="isCheckAll"
                :label="`${$t('zen.common.selectAll')} / ${$t('zen.common.unselectAll')}`"
                @change="handleChooseAll"
              />
            </div>
            <ElTree
              ref="treeRef"
              :data="menuTree"
              :props="treeMapConf"
              check-strictly
              class="min-h-60 overflow-y-auto rounded-lg border pt-1"
              node-key="id"
              show-checkbox
            />
          </div>
        </ElFormItem>
      </ElCol>

      <ElCol :xs="24">
        <ElFormItem :label="$t('zen.service.package.status')">
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
        <ElFormItem :label="$t('zen.service.package.remark')">
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
