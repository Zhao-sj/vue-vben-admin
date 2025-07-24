<script setup lang="ts">
import type { DeptApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { addDeptApi, getDeptApi, updateDeptApi } from '#/api';
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
    ? $t('page.actionTitle.edit', [$t('sys.dept.title')])
    : $t('page.actionTitle.create', [$t('sys.dept.title')]);
});

const { loading, runAsync: getDept } = useRequest(getDeptApi, {
  loadingDelay: 200,
  manual: true,
});

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      clearable: true,
    },
    labelClass: 'mr-4',
    labelWidth: 80,
  },
  schema: useFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 lg:grid-cols-2 gap-x-4',
});

const [Drawer, drawerApi] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    formApi.updateSchema(useFormSchema());
    const { id: deptId, parentId } = drawerApi.getData<DeptApi.Dept>();
    if (parentId) {
      formApi.setFieldValue('parentId', parentId);
    }
    if (deptId) {
      const dept = await getDept(deptId);
      id.value = deptId;
      formApi.setValues(dept);
      formApi.setFieldValue('id', deptId);
    }
  }
}

async function onConfirm() {
  const { valid } = await formApi.validate();
  if (!valid) return;
  const values = await formApi.getValues();
  drawerApi.lock();
  (id.value
    ? updateDeptApi(values as DeptApi.UpdateModel)
    : addDeptApi(values as DeptApi.AddModel)
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
    class="md:w-1/2 2xl:w-1/3"
    footer-class="gap-x-0"
  >
    <Form />
  </Drawer>
</template>
