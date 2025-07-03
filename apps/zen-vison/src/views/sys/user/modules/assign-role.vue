<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';
import type { UserApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { isEmpty } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import {
  assignUserRoleApi,
  getRoleSimpleListApi,
  getUserRoleListApi,
} from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

interface Emits {
  (e: 'success'): void;
}

const emit = defineEmits<Emits>();

const { loading, runAsync: getRoleIds } = useRequest(getUserRoleListApi, {
  loadingDelay: 200,
  manual: true,
});

const schema: VbenFormSchema[] = [
  {
    component: 'Input',
    componentProps: {
      disabled: true,
    },
    fieldName: 'username',
    label: $t('sys.user.username'),
  },
  {
    component: 'Input',
    componentProps: {
      disabled: true,
    },
    fieldName: 'nickname',
    label: $t('sys.user.nickname'),
  },
  {
    component: 'ApiSelect',
    componentProps: {
      api: getRoleSimpleListApi,
      labelField: 'name',
      valueField: 'id',
      clearable: true,
      multiple: true,
    },
    fieldName: 'roleIds',
    label: $t('sys.user.role'),
  },
];

const [Form, formApi] = useVbenForm({
  schema,
  commonConfig: {
    labelClass: 'mr-4',
    labelWidth: 40,
    colon: true,
  },
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

const [Drawer, drawerApi] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    const data = drawerApi.getData<UserApi.User>();
    if (!isEmpty(data)) {
      const roleIds = await getRoleIds(data.id);
      formApi.setValues(
        {
          id: data.id,
          nickname: data.nickname,
          username: data.username,
          roleIds,
        },
        false,
      );
    }
  }
}

async function onConfirm() {
  drawerApi.lock();
  const values = await formApi.getValues();
  assignUserRoleApi({
    userId: values.id,
    roleIds: values.roleIds,
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
    :loading
    :title="$t('sys.user.assignRole')"
    class="md:w-1/3 2xl:w-1/5"
    footer-class="gap-x-0"
  >
    <Form />
  </Drawer>
</template>
