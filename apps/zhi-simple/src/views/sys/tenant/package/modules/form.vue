<script setup lang="ts">
import type { TenantApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { isEmpty } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import {
  addTenantPackageApi,
  getMenuSimpleListApi,
  getTenantPackageApi,
  updateTenantPackageApi,
} from '#/api';
import { MenuSelectTable } from '#/components';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

interface Emits {
  (e: 'success'): void;
}

const emit = defineEmits<Emits>();

const menuSelectRef = useTemplateRef('menuSelectTable');
const id = ref<number>();

const getDrawerTitle = computed(() => {
  return id.value
    ? $t('page.actionTitle.edit', [$t('sys.tenant.package.title')])
    : $t('page.actionTitle.create', [$t('sys.tenant.package.title')]);
});

const requestConf = {
  loadingDelay: 200,
  manual: true,
};

const {
  data: menus,
  loading: menuLoading,
  runAsync: getMenu,
} = useRequest(getMenuSimpleListApi, requestConf);

const { loading: pckLoading, runAsync: getPackage } = useRequest(
  getTenantPackageApi,
  requestConf,
);

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  commonConfig: {
    componentProps: {
      clearable: true,
    },
  },
  schema: useFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

const [Drawer, drawerApi] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    await getMenu();
    const data = drawerApi.getData<TenantApi.Package>();
    if (!isEmpty(data)) {
      const tenantPackage = await getPackage(data.id);
      id.value = tenantPackage.id;
      formApi.setValues(tenantPackage);
      formApi.setFieldValue('id', tenantPackage.id);
      menuSelectRef.value?.setCheckedKeys(tenantPackage.menuIds);
    }
  }
}

async function onConfirm() {
  const { valid } = await formApi.validate();
  if (!valid) return;
  const values = await formApi.getValues<TenantApi.Package>();
  values.menuIds = menuSelectRef.value!.getCheckedKeys();
  drawerApi.lock();
  (id.value
    ? updateTenantPackageApi(values as TenantApi.UpdatePackageModel)
    : addTenantPackageApi(values as TenantApi.AddPackageModel)
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
    :loading="menuLoading || pckLoading"
    :title="getDrawerTitle"
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
