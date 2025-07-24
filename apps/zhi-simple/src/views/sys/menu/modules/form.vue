<script setup lang="ts">
import type { MenuApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { addMenuApi, getMenuApi, updateMenuApi } from '#/api';
import { MenuType } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

import { formData, titleSuffix, useFormSchema } from '../data';

interface Emits {
  (e: 'success'): void;
}

const emit = defineEmits<Emits>();

const id = ref<number>();

const getDrawerTitle = computed(() => {
  return id.value
    ? $t('page.actionTitle.edit', [$t('sys.menu.title')])
    : $t('page.actionTitle.create', [$t('sys.menu.title')]);
});

const { loading, runAsync: getMenu } = useRequest(getMenuApi, {
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
    titleSuffix.value = undefined;
    formApi.updateSchema(useFormSchema());
    const { id: menuId, parentId } = drawerApi.getData<MenuApi.Menu>();
    if (parentId) {
      formApi.setFieldValue('parentId', parentId);
    }
    if (menuId) {
      const menu = await getMenu(menuId);
      if (menu.type === MenuType.LINK) {
        menu.linkSrc = menu.meta?.link;
      } else if (menu.type === MenuType.EMBEDDED) {
        menu.linkSrc = menu.meta?.iframeSrc;
      }
      id.value = menuId;
      formData.value = menu;
      titleSuffix.value = menu.meta?.title ? $t(menu.meta.title) : '';
      formApi.setValues(menu);
      formApi.setFieldValue('id', menuId);
    }
  }
}

async function onConfirm() {
  const { valid } = await formApi.validate();
  if (!valid) return;
  const values = await formApi.getValues();
  if (values.type === MenuType.LINK) {
    values.meta = {
      ...values.meta,
      iframeSrc: undefined,
      link: values.linkSrc,
    };
  } else if (values.type === MenuType.EMBEDDED) {
    values.meta = {
      ...values.meta,
      link: undefined,
      iframeSrc: values.linkSrc,
    };
  }
  drawerApi.lock();
  (id.value
    ? updateMenuApi(values as MenuApi.UpdateModel)
    : addMenuApi(values as MenuApi.AddModel)
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
    class="md:w-2/3 2xl:w-2/5"
    footer-class="gap-x-0"
  >
    <Form />
  </Drawer>
</template>
