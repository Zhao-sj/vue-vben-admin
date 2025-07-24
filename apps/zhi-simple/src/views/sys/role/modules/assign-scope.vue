<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';
import type { RoleApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { ElTree } from 'element-plus';
import { cloneDeep, isEmpty } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import {
  assignRoleDataScopeApi,
  buildMenuTree,
  getDeptSimpleListApi,
} from '#/api';
import { DictRoleDataScope, DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

interface Emits {
  (e: 'success'): void;
}

const emit = defineEmits<Emits>();

const dictStore = useDictStore();

const treeMapConf = {
  label: 'name',
  children: 'children',
};

const treeRef = useTemplateRef('treeRef');
const checkStrictly = ref(true);
const isExpandAll = ref(true);

const {
  data: deptList,
  loading,
  runAsync: getDeptList,
} = useRequest(getDeptSimpleListApi, {
  loadingDelay: 200,
  manual: true,
});

const deptTree = computed(() => buildMenuTree(cloneDeep(deptList.value || [])));

const schema: VbenFormSchema[] = [
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
    component: 'ApiSelect',
    componentProps: {
      api: () => dictStore.loadDictData(DictTypeEnum.DATA_SCOPE),
      afterFetch: () => {
        return dictStore
          .getDictDataList(DictTypeEnum.DATA_SCOPE)
          .map((item) => ({
            label: item.label,
            value: +item.value,
          }));
      },
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
    formItemClass: 'flex-col items-start [&>*]:w-full',
  },
];

const [Form, formApi] = useVbenForm({
  commonConfig: {
    labelClass: 'mr-4',
    labelWidth: 60,
  },
  schema,
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

const [Drawer, drawerApi] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    await getDeptList();
    const data = drawerApi.getData<RoleApi.Role>();
    if (!isEmpty(data)) {
      if (!data.dataScopeDeptIds) {
        data.dataScopeDeptIds = [];
      }

      formApi.setValues(data);
      formApi.setFieldValue('id', data.id);
      setCheckedKeys(data.dataScope, data.dataScopeDeptIds);
    }
  }
}

async function onConfirm() {
  const values = await formApi.getValues();
  const dataScopeDeptIds = treeRef.value?.getCheckedKeys() as number[];
  drawerApi.lock();
  assignRoleDataScopeApi({
    roleId: values.id,
    dataScope: values.dataScope,
    dataScopeDeptIds: dataScopeDeptIds || [],
  })
    .then(() => {
      emit('success');
      drawerApi.close();
    })
    .catch(() => {
      drawerApi.unlock();
    });
}

function onExpandChange(checked: boolean | number | string) {
  deptList.value.forEach((item) => {
    treeRef.value!.store.nodesMap[item.id]!.expanded = checked as boolean;
  });
}

function onChooseAll(checked: boolean | number | string) {
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
</script>

<template>
  <Drawer
    :loading
    :title="$t('sys.role.assignScope')"
    class="md:w-1/3 2xl:w-1/4"
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
              @change="onExpandChange"
            />
            <ElCheckbox
              :label="`${$t('page.selectAll')} / ${$t('page.unselectAll')}`"
              @change="onChooseAll"
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
