<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

import type { FormState } from './typing';

import { useDebounceFn } from '@vueuse/core';

import { buildMenuTree, getMenuUniqueApi, type MenuApi } from '#/api';
import { DictTypeEnum, MENU_ROOT, MenuType } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

import FormItemHelp from './FormItemHelp.vue';
import MetaForm from './MetaForm.vue';

interface Props {
  menus?: MenuApi.Simple[];
  edit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  menus: () => [],
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

const formState = defineModel<FormState>('modelValue', {
  required: true,
});

const componentList = [{ value: 'BasicLayout' }];

const menuTypeOpts = computed(() => [
  { label: $t('zen.service.menu.dir'), value: MenuType.DIR },
  { label: $t('zen.service.menu.menu'), value: MenuType.MENU },
  { label: $t('zen.service.menu.button'), value: MenuType.BUTTON },
]);

const statusOpts = computed(() =>
  dictStore.getDictDataList(DictTypeEnum.STATUS),
);

const menuTree = computed(() => {
  const menuList = props.menus.filter((item) => item.type !== MenuType.BUTTON);
  menuList.push({
    id: MENU_ROOT,
    name: $t('zen.service.menu.root'),
    parentId: -1,
    type: MenuType.DIR,
  });
  return buildMenuTree(menuList);
});

const validateUnique = useDebounceFn(async (name: string) => {
  const isUnique = await getMenuUniqueApi(name);
  if (!isUnique) {
    throw new Error(
      `${$t('zen.service.menu.componentName')}${$t('zen.service.menu.joinExists')}`,
    );
  }
});

const rules = computed<FormRules<MenuApi.AddModel>>(() => ({
  componentName: [
    {
      message: t($t('zen.service.menu.componentName')),
      required: true,
      trigger: 'blur',
    },
    props.edit
      ? {}
      : {
          asyncValidator: (_, val) => {
            if (!val) {
              return Promise.resolve();
            }
            return validateUnique(val);
          },
          message: `${$t('zen.service.menu.componentName')}${$t('zen.service.menu.joinExists')}`,
          trigger: ['change', 'blur'],
        },
  ],
  name: [
    {
      message: t($t('zen.service.menu.name')),
      required: true,
      trigger: 'blur',
    },
  ],
  parentId: [
    {
      message: t($t('zen.service.menu.parent')),
      required: true,
      trigger: 'blur',
    },
  ],
  path: [
    {
      message: t($t('zen.service.menu.path')),
      required: true,
      trigger: 'blur',
    },
  ],
  sort: [
    {
      message: t($t('zen.service.menu.sort')),
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

function handleComponentAuto(qs: string, cb: any) {
  const result = componentList.filter((item) =>
    item.value.toLowerCase().includes(qs.trim().toLowerCase()),
  );

  cb(result);
}
</script>

<template>
  <div>
    <ElForm ref="formRef" :label-width="100" :model="formState" :rules>
      <ElRow :gutter="20">
        <ElCol :xs="24">
          <ElFormItem :label="$t('zen.service.menu.type')">
            <ElRadioGroup v-model="formState.type">
              <ElRadioButton
                v-for="item in menuTypeOpts"
                :key="item.value"
                :label="item.label"
                :value="+item.value"
              />
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>

        <ElCol :lg="12" :xs="24">
          <ElFormItem :label="$t('zen.service.menu.name')" prop="name" required>
            <ElInput
              v-model="formState.name"
              :placeholder="$t('zen.common.pleaseInput')"
              clearable
            />
          </ElFormItem>
        </ElCol>

        <ElCol :lg="12" :xs="24">
          <ElFormItem
            :label="$t('zen.service.menu.parent')"
            prop="parentId"
            required
          >
            <ElTreeSelect
              v-model="formState.parentId"
              :current-node-key="formState.parentId"
              :data="menuTree"
              :expand-on-click-node="false"
              :props="treeMapConf"
              check-strictly
              clearable
              node-key="id"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :lg="12" :xs="24">
          <ElFormItem :label="$t('zen.service.menu.sort')" prop="sort" required>
            <ElInputNumber
              v-model="formState.sort"
              :min="0"
              :placeholder="$t('zen.common.pleaseInput')"
              class="!w-full"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>

        <ElCol v-if="formState.type !== MenuType.BUTTON" :lg="12" :xs="24">
          <FormItemHelp
            :content="$t('zen.service.menu.iconTip')"
            :label="$t('zen.service.menu.icon')"
          >
            <ElInput
              v-model="formState.meta.icon"
              :placeholder="$t('zen.common.pleaseInput')"
              clearable
            />
          </FormItemHelp>
        </ElCol>

        <ElCol
          v-if="formState.type !== MenuType.BUTTON && !formState.meta.link"
          :lg="12"
          :xs="24"
        >
          <FormItemHelp
            :content="$t('zen.service.menu.pathTip')"
            :label="$t('zen.service.menu.path')"
            prop="path"
            required
          >
            <ElInput
              v-model="formState.path"
              :placeholder="$t('zen.common.pleaseInput')"
              clearable
            />
          </FormItemHelp>
        </ElCol>

        <ElCol v-if="formState.type !== MenuType.BUTTON" :lg="12" :xs="24">
          <FormItemHelp
            :content="$t('zen.service.menu.componentNameTip')"
            :label="$t('zen.service.menu.componentName')"
            class="!mb-0"
            prop="componentName"
            required
          >
            <ElInput
              v-model="formState.componentName"
              :placeholder="$t('zen.common.pleaseInput')"
              clearable
            />
          </FormItemHelp>
        </ElCol>

        <ElCol v-if="formState.type !== MenuType.BUTTON" :lg="12" :xs="24">
          <FormItemHelp
            :content="$t('zen.service.menu.componentTip')"
            :label="$t('zen.service.menu.component')"
          >
            <ElAutocomplete
              v-model="formState.component"
              :fetch-suggestions="handleComponentAuto"
              :placeholder="$t('zen.common.pleaseInput')"
              :teleported="false"
              :trigger-on-focus="false"
              clearable
            />
          </FormItemHelp>
        </ElCol>

        <ElCol v-if="formState.type !== MenuType.DIR" :lg="12" :xs="24">
          <FormItemHelp
            :content="$t('zen.service.menu.permissionTip')"
            :label="$t('zen.service.menu.permission')"
          >
            <ElInput
              v-model="formState.permission"
              :placeholder="$t('zen.common.pleaseInput')"
              clearable
            />
          </FormItemHelp>
        </ElCol>

        <ElCol :lg="12" :xs="24">
          <ElFormItem :label="$t('zen.service.menu.status')" class="!mb-0">
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

    <ElCollapseTransition>
      <MetaForm
        v-show="formState.type !== MenuType.BUTTON"
        v-model="formState.meta"
        :type="formState.type"
      />
    </ElCollapseTransition>
  </div>
</template>
