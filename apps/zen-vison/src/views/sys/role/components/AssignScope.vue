<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';

import { useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { ElTree } from 'element-plus';
import { cloneDeep } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import {
  assignRoleDataScopeApi,
  buildMenuTree,
  getDeptSimpleListApi,
  getRoleApi,
} from '#/api';
import { DictRoleDataScope, DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

const dictStore = useDictStore();

const requestConf = {
  loadingDelay: 200,
  manual: true,
};

const treeMapConf = {
  label: 'name',
  children: 'children',
};

const treeRef = useTemplateRef<InstanceType<typeof ElTree>>('treeRef');
const checkStrictly = ref(true);
const isExpandAll = ref(true);

const {
  data: deptList,
  loading: deptLoading,
  runAsync: getDeptList,
} = useRequest(getDeptSimpleListApi, requestConf);

const {
  data: role,
  loading: roleLoading,
  runAsync: getRole,
} = useRequest(getRoleApi, requestConf);

const { loading, runAsync } = useRequest(assignRoleDataScopeApi, requestConf);

const [Drawer, drawer] = useVbenDrawer({ onConfirm, onOpenChange });

const deptTree = computed(() => buildMenuTree(cloneDeep(deptList.value || [])));

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    componentProps: {
      disabled: true,
    },
    fieldName: 'name',
    label: $t('sys.role.name'),
  },
  {
    component: 'Input',
    componentProps: {
      disabled: true,
    },
    fieldName: 'code',
    label: $t('sys.role.code'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore
        .getDictDataList(DictTypeEnum.DATA_SCOPE)
        .map((item) => ({
          label: item.label,
          value: +item.value,
        })),
    },
    fieldName: 'dataScope',
    label: $t('sys.role.dataScope'),
  },
  {
    component: 'Input',
    dependencies: {
      if(values) {
        return values.dataScope === DictRoleDataScope.CUSTOM;
      },
      trigger(values) {
        setCheckedKeys(values.dataScope, values.dataScopeDeptIds || []);
      },
      triggerFields: ['dataScope'],
    },
    fieldName: 'dataScopeDeptIds',
    label: $t('sys.role.customScope'),
    labelClass: 'self-start h-8',
  },
]);

const [Form, formApi] = useVbenForm(
  reactive({
    commonConfig: {
      labelClass: 'mr-4',
      labelWidth: 65,
    },
    schema: formSchema,
    showDefaultActions: false,
    wrapperClass: 'grid-cols-1',
  }),
);

function handleExpand(checked: boolean | number | string) {
  deptList.value.forEach((item) => {
    treeRef.value!.store.nodesMap[item.id]!.expanded = checked as boolean;
  });
}

function handleChooseAll(checked: boolean | number | string) {
  treeRef.value!.setCheckedKeys(
    checked ? deptList.value.map((item) => item.id) : [],
  );
}

function setCheckedKeys(dataScope: number, dataScopeDeptIds: number[]) {
  if (dataScope === DictRoleDataScope.CUSTOM) {
    nextTick(() => {
      treeRef.value?.setCheckedKeys(dataScopeDeptIds);
    });
  }
}

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    checkStrictly.value = true;
    isExpandAll.value = true;
    return;
  }

  const { id } = drawer.getData();
  if (id) {
    const [role] = await Promise.all([getRole(id), getDeptList()]);
    if (!role.dataScopeDeptIds) {
      role.dataScopeDeptIds = [];
    }

    formApi.setValues(role);
    setCheckedKeys(role.dataScope, role.dataScopeDeptIds);
  }
}

async function onConfirm() {
  const { dataScope } = await formApi.getValues();
  const dataScopeDeptIds = treeRef.value?.getCheckedKeys() as number[];

  await runAsync({
    dataScope,
    dataScopeDeptIds: dataScopeDeptIds || [],
    roleId: role.value.id,
  });
  ElMessage.success($t('page.success'));
  drawer.close();
}
</script>

<template>
  <Drawer
    :confirm-loading="loading"
    :loading="dictStore.loading || roleLoading || deptLoading"
    :title="$t('sys.role.assignScope')"
    class="md:w-1/3 2xl:w-1/5"
    destroy-on-close
    footer-class="gap-x-0"
  >
    <Form>
      <template #dataScopeDeptIds>
        <div class="w-full">
          <div>
            <ElCheckbox v-model="checkStrictly">
              <div class="flex items-center gap-1">
                <ElTooltip :content="$t('sys.role.strictly.tip')">
                  <IconifyIcon
                    class="cursor-help outline-none"
                    icon="lucide:circle-help"
                  />
                </ElTooltip>
                <span>{{ $t('sys.role.strictly.title') }}</span>
              </div>
            </ElCheckbox>

            <ElCheckbox
              v-model="isExpandAll"
              :label="`${$t('page.expand')} / ${$t('page.collapsed')}`"
              @change="handleExpand"
            />
            <ElCheckbox
              :label="`${$t('page.selectAll')} / ${$t('page.unselectAll')}`"
              @change="handleChooseAll"
            />
          </div>
          <ElTree
            ref="treeRef"
            :check-strictly="!checkStrictly"
            :data="deptTree"
            :props="treeMapConf"
            class="min-h-60 overflow-y-auto rounded-lg border pt-1"
            default-expand-all
            node-key="id"
            show-checkbox
          />
        </div>
      </template>
    </Form>
  </Drawer>
</template>
