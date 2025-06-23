<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';
import type { RoleApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import {
  assignRoleMenuApi,
  getMenuSimpleListApi,
  getRoleApi,
  getRoleMenuListApi,
} from '#/api';
import { MenuSelectTable } from '#/components';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

type FormState = Pick<RoleApi.Role, 'code' | 'id' | 'name'>;

const requestConf = {
  loadingDelay: 200,
  manual: true,
};

const menuSelectRef = useTemplateRef('menuSelectTable');

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

const [Drawer, drawer] = useVbenDrawer({ onConfirm, onOpenChange });

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
    component: 'Input',
    fieldName: 'menuIds',
    label: $t('sys.role.menuPermission'),
    formItemClass: 'lg:col-span-2 flex-col items-start [&>*]:w-full',
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
    wrapperClass: 'grid-cols-1 lg:grid-cols-2 gap-x-4',
  }),
);

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = drawer.getData();
  if (id) {
    const [role, menuIds] = await Promise.all([
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
    menuSelectRef.value?.setCheckedKeys(menuIds);
  }
}

async function onConfirm() {
  const menuIds = menuSelectRef.value!.getCheckedKeys();
  await runAsync({ menuIds, roleId: role.value.id });
  ElMessage.success($t('page.success'));
  drawer.close();
}
</script>

<template>
  <Drawer
    :confirm-loading="loading"
    :loading="roleLoading || menuLoading || menuIdsLoading"
    :title="$t('sys.role.assignMenu')"
    class="md:w-1/2 2xl:w-2/5"
    destroy-on-close
    footer-class="gap-x-0"
  >
    <Form>
      <template #menuIds>
        <div class="h-[600px] w-full">
          <MenuSelectTable ref="menuSelectTable" :menus />
        </div>
      </template>
    </Form>
  </Drawer>
</template>
