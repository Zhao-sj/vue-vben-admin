<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';
import { Icon } from '@vben/icons';

import { ElTree } from 'element-plus';
import { cloneDeep } from 'lodash-es';

import {
  assignRoleDataScopeApi,
  buildMenuTree,
  getDeptSimpleListApi,
  getRoleApi,
  type RoleApi,
} from '#/api';
import { DictTypeEnum, RoleDataScope } from '#/enums';
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

const formState = ref<Partial<RoleApi.Role>>({});
const treeRef = ref<InstanceType<typeof ElTree>>();
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

const dataScope = computed(() =>
  dictStore.getDictDataList(DictTypeEnum.DATA_SCOPE),
);

const deptTree = computed(() => buildMenuTree(cloneDeep(deptList.value || [])));

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
  if (dataScope === RoleDataScope.CUSTOM) {
    nextTick(() => {
      treeRef.value?.setCheckedKeys(dataScopeDeptIds);
    });
  }
}

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    formState.value = {};
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
    formState.value = role;
    setCheckedKeys(role.dataScope, role.dataScopeDeptIds);
  }
}

async function onConfirm() {
  const { dataScope, id } = formState.value;
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

watch(
  () => formState.value.dataScope,
  (dataScope) => {
    dataScope &&
      setCheckedKeys(dataScope, formState.value.dataScopeDeptIds || []);
  },
);
</script>

<template>
  <Modal
    :cancel-text="$t('zen.common.cancel')"
    :confirm-loading="loading"
    :confirm-text="$t('zen.common.confirm')"
    :loading="dictStore.loading || roleLoading || deptLoading"
    :title="$t('zen.service.role.assignScope')"
    class="w-11/12 md:w-1/2 2xl:w-1/3"
    draggable
  >
    <ElForm :label-width="80" :model="formState">
      <ElRow :gutter="20">
        <ElCol :xs="24">
          <ElFormItem :label="$t('zen.service.role.name')">
            <ElInput :model-value="formState.name" disabled />
          </ElFormItem>
        </ElCol>

        <ElCol :xs="24">
          <ElFormItem :label="$t('zen.service.role.code')">
            <ElInput :model-value="formState.code" disabled />
          </ElFormItem>
        </ElCol>

        <ElCol :xs="24">
          <ElFormItem :label="$t('zen.service.role.dataScope')">
            <ElSelect v-model="formState.dataScope">
              <ElOption
                v-for="item in dataScope"
                :key="item.id"
                :label="item.label"
                :value="+item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCollapseTransition>
          <ElCol v-if="formState.dataScope === RoleDataScope.CUSTOM" :xs="24">
            <ElFormItem :label="$t('zen.service.role.customScope')">
              <div class="w-full">
                <div>
                  <ElCheckbox v-model="checkStrictly">
                    <div class="flex items-center gap-1">
                      <ElTooltip :content="$t('zen.service.role.strictlyTip')">
                        <Icon icon="ep:question-filled" />
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
            </ElFormItem>
          </ElCol>
        </ElCollapseTransition>
      </ElRow>
    </ElForm>
  </Modal>
</template>
