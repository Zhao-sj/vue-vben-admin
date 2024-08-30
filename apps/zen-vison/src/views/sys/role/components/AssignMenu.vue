<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { ElTree } from 'element-plus';
import { cloneDeep } from 'lodash-es';

import {
  assignRoleMenuApi,
  buildMenuTree,
  getMenuSimpleListApi,
  getRoleApi,
  getRoleMenuListApi,
  type RoleApi,
} from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

type FormState = Pick<RoleApi.Role, 'code' | 'id' | 'name'>;

const requestConf = {
  loadingDelay: 200,
  manual: true,
};

const formState = ref<Partial<FormState>>({});
const treeRef = ref<InstanceType<typeof ElTree>>();
const isCheckAll = ref(false);

const treeMapConf = {
  label: 'name',
  children: 'children',
};

const {
  data: menus,
  loading: menuLoading,
  runAsync: getMenu,
} = useRequest(getMenuSimpleListApi, requestConf);

const { loading: menuIdsLoading, runAsync: getMenuIds } = useRequest(
  getRoleMenuListApi,
  requestConf,
);

const { loading: roleLoading, runAsync: getRole } = useRequest(
  getRoleApi,
  requestConf,
);

const { loading, runAsync } = useRequest(assignRoleMenuApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

const menuTree = computed(() => buildMenuTree(cloneDeep(menus.value || [])));

function handleExpand(checked: boolean | number | string) {
  menus.value.forEach((item) => {
    treeRef.value!.store.nodesMap[item.id]!.expanded = checked as boolean;
  });
}

function handleChooseAll(checked: boolean | number | string) {
  treeRef.value!.setCheckedKeys(
    checked ? menus.value.map((item) => item.id) : [],
  );
}

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    formState.value = {};
    return;
  }

  const { id } = modal.getData();
  if (id) {
    const [role, menuIds, menu] = await Promise.all([
      getRole(id),
      getMenuIds(id),
      getMenu(),
    ]);

    const state: Partial<FormState> = {
      code: role.code,
      id: role.id,
      name: role.name,
    };

    formState.value = state;
    treeRef.value?.setCheckedKeys(menuIds);
    isCheckAll.value = menu.every((item) => menuIds.includes(item.id));
  }
}

async function onConfirm() {
  const { id } = formState.value;
  if (!id) {
    return;
  }

  const menuIds = treeRef.value!.getCheckedKeys() as number[];
  await runAsync({ menuIds, roleId: id });
  ElMessage.success($t('zen.common.successTip'));
  modal.close();
}
</script>

<template>
  <Modal
    :cancel-text="$t('zen.common.cancel')"
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :confirm-text="$t('zen.common.confirm')"
    :loading="roleLoading || menuLoading || menuIdsLoading"
    :title="$t('zen.service.role.assignMenu')"
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
          <ElFormItem :label="$t('zen.service.role.menuPermission')">
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
      </ElRow>
    </ElForm>
  </Modal>
</template>
