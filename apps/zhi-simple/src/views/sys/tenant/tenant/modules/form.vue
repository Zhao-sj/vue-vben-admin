<script setup lang="ts">
import type { TenantApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import dayjs from 'dayjs';
import { isEmpty } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import { addTenantApi, getTenantApi, updateTenantApi } from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { encryptBySha256 } from '#/utils';

import { useFormSchema } from '../data';

interface Emits {
  (e: 'success'): void;
}

const emit = defineEmits<Emits>();

const id = ref<number>();

const getDrawerTitle = computed(() => {
  return id.value
    ? $t('page.actionTitle.edit', [$t('sys.tenant.list.title')])
    : $t('page.actionTitle.create', [$t('sys.tenant.list.title')]);
});

const { loading, runAsync: getTenant } = useRequest(getTenantApi, {
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
    const data = drawerApi.getData<TenantApi.Tenant>();
    if (!isEmpty(data)) {
      const tenant = await getTenant(data.id);
      id.value = tenant.id;
      formApi.setValues(tenant);
      formApi.setFieldValue('id', tenant.id);
    }
  }
}

async function onConfirm() {
  const { valid } = await formApi.validate();
  if (!valid) return;
  const values = await formApi.getValues();
  values.expireTime = dayjs(values.expireTime).valueOf();
  if (values.password) {
    values.password = encryptBySha256(values.password);
  }
  drawerApi.lock();
  (id.value
    ? updateTenantApi(values as TenantApi.UpdateModel)
    : addTenantApi(values as TenantApi.AddModel)
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
