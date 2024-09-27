<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';
import { Icon } from '@vben/icons';

import { ElTree } from 'element-plus';
import { cloneDeep } from 'lodash-es';

import { useVbenForm, type VbenFormSchema } from '#/adapter';
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

const { loading: roleLoading, runAsync: getRole } = useRequest(
  getRoleApi,
  requestConf,
);

const { loading, runAsync } = useRequest(assignRoleDataScopeApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

const deptTree = computed(() => buildMenuTree(cloneDeep(deptList.value || [])));

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    componentProps: {
      disabled: true,
    },
    fieldName: 'name',
    label: $t('zen.service.role.name'),
  },
  {
    component: 'Input',
    componentProps: {
      disabled: true,
    },
    fieldName: 'code',
    label: $t('zen.service.role.code'),
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
    label: $t('zen.service.role.dataScope'),
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
    label: $t('zen.service.role.customScope'),
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

  const { id } = modal.getData();
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
  const { dataScope, id } = await formApi.getValues();
  if (!id) {
    return;
  }

  const dataScopeDeptIds = treeRef.value?.getCheckedKeys() as number[];

  await runAsync({
    dataScope: dataScope!,
    dataScopeDeptIds: dataScopeDeptIds || [],
    roleId: id,
  });
  ElMessage.success($t('zen.common.successTip'));
  modal.close();
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="dictStore.loading || roleLoading || deptLoading"
    :title="$t('zen.service.role.assignScope')"
    class="w-11/12 md:w-1/2 2xl:w-1/3"
    draggable
  >
    <Form>
      <template #dataScopeDeptIds>
        <div class="w-full">
          <div>
            <ElCheckbox v-model="checkStrictly">
              <div class="flex items-center gap-1">
                <ElTooltip :content="$t('zen.service.role.strictlyTip')">
                  <Icon
                    class="cursor-help outline-none"
                    icon="lucide:circle-help"
                  />
                </ElTooltip>
                <span>{{ $t('zen.service.role.strictly') }}</span>
              </div>
            </ElCheckbox>

            <ElCheckbox
              v-model="isExpandAll"
              :label="`${$t('zen.common.expand')} / ${$t('zen.common.collapsed')}`"
              @change="handleExpand"
            />
            <ElCheckbox
              :label="`${$t('zen.common.selectAll')} / ${$t('zen.common.unselectAll')}`"
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
  </Modal>
</template>
