<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';
import type { RoleApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { isEmpty } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import {
  assignRoleMenuApi,
  getMenuSimpleListApi,
  getRoleMenuListApi,
} from '#/api';
import { MenuSelectTable } from '#/components';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

interface Emits {
  (e: 'success'): void;
}

const emit = defineEmits<Emits>();

const menuSelectRef = useTemplateRef('menuSelectTable');

const requestConf = {
  loadingDelay: 200,
  manual: true,
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
    component: 'Input',
    fieldName: 'menuIds',
    label: $t('sys.role.menuPermission'),
    formItemClass: 'lg:col-span-2 flex-col items-start [&>*]:w-full',
  },
];

const [Form, formApi] = useVbenForm({
  commonConfig: {
    labelClass: 'mr-4',
    labelWidth: 65,
  },
  schema,
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 lg:grid-cols-2 gap-x-4',
});

const [Drawer, drawerApi] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    await getMenu();
    const data = drawerApi.getData<RoleApi.Role>();
    if (!isEmpty(data)) {
      const menuIds = await getMenuIds(data.id);
      formApi.setValues(
        {
          id: data.id,
          name: data.name,
          code: data.code,
        },
        false,
      );
      menuSelectRef.value?.setCheckedKeys(menuIds);
    }
  }
}

async function onConfirm() {
  const values = await formApi.getValues();
  const menuIds = menuSelectRef.value!.getCheckedKeys();
  drawerApi.lock();
  assignRoleMenuApi({
    roleId: values.id,
    menuIds,
  })
    .then(() => {
      emit('success');
      drawerApi.close();
    })
    .catch(() => {
      drawerApi.unlock();
    });
}
</script>

<template>
  <Drawer
    :loading="menuLoading || menuIdsLoading"
    :title="$t('sys.role.assignMenu')"
    class="md:w-1/2 2xl:w-2/5"
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
