<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { ElTree } from 'element-plus';
import { cloneDeep } from 'lodash-es';

import { useVbenForm, type VbenFormSchema } from '#/adapter';
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

const treeRef = useTemplateRef<InstanceType<typeof ElTree>>('treeRef');
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

const {
  data: role,
  loading: roleLoading,
  runAsync: getRole,
} = useRequest(getRoleApi, requestConf);

const { loading, runAsync } = useRequest(assignRoleMenuApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

const menuTree = computed(() => buildMenuTree(cloneDeep(menus.value || [])));

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
    component: 'Input',
    fieldName: 'menuIds',
    label: $t('zen.service.role.menuPermission'),
    labelClass: 'self-start h-8',
  },
]);

const [Form, formApi] = useVbenForm(
  reactive({
    commonConfig: {
      labelClass: 'mr-4',
      labelWidth: 80,
    },
    schema: formSchema,
    showDefaultActions: false,
    wrapperClass: 'grid-cols-1',
  }),
);

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

    formApi.setValues(state);
    treeRef.value?.setCheckedKeys(menuIds);
    isCheckAll.value = menu.every((item) => menuIds.includes(item.id));
  }
}

async function onConfirm() {
  const menuIds = treeRef.value!.getCheckedKeys() as number[];
  await runAsync({ menuIds, roleId: role.value.id });
  ElMessage.success($t('zen.common.successTip'));
  modal.close();
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="roleLoading || menuLoading || menuIdsLoading"
    :title="$t('zen.service.role.assignMenu')"
    class="w-11/12 md:w-1/2 2xl:w-1/3"
    draggable
  >
    <Form>
      <template #menuIds>
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
      </template>
    </Form>
  </Modal>
</template>
