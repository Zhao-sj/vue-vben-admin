<script setup lang="ts">
import type { RoleApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { isEmpty } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import { addRoleApi, getRoleApi, updateRoleApi } from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

interface Emits {
  (e: 'success'): void;
}

const emit = defineEmits<Emits>();

const id = ref<number>();

const getDrawerTitle = computed(() => {
  return id.value
    ? $t('page.actionTitle.edit', [$t('sys.role.title')])
    : $t('page.actionTitle.create', [$t('sys.role.title')]);
});

const { loading, runAsync: getRole } = useRequest(getRoleApi, {
  loadingDelay: 200,
  manual: true,
});

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      clearable: true,
    },
    labelClass: 'mr-4',
    labelWidth: 65,
  },
  schema: useFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

const [Drawer, drawerApi] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    const data = drawerApi.getData<RoleApi.Role>();
    if (!isEmpty(data)) {
      const role = await getRole(data.id);
      id.value = role.id;
      formApi.setValues(role);
      formApi.setFieldValue('id', role.id);
    }
  }
}

async function onConfirm() {
  const { valid } = await formApi.validate();
  if (!valid) return;
  const values = await formApi.getValues();
  drawerApi.lock();
  (id.value
    ? updateRoleApi(values as RoleApi.UpdateModel)
    : addRoleApi(values as RoleApi.AddModel)
  )
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
    :title="getDrawerTitle"
    class="lg:w-1/3 2xl:w-1/4"
    footer-class="gap-x-0"
  >
    <Form />
  </Drawer>
</template>
