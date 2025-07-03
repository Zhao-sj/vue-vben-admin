<script setup lang="ts">
import type { FileApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { isEmpty } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import { addFileConfigApi, getFileConfigApi, updateFileConfigApi } from '#/api';
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
    ? $t('page.actionTitle.edit', [$t('infra.file.config.title')])
    : $t('page.actionTitle.create', [$t('infra.file.config.title')]);
});

const { loading, runAsync: getFileConfig } = useRequest(getFileConfigApi, {
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
    formItemClass: 'lg:col-span-2',
  },
  schema: useFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 lg:grid-cols-2 gap-x-4',
});

const [Drawer, drawerApi] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    const data = drawerApi.getData<FileApi.Config>();
    const isEdit = !isEmpty(data);
    formApi.updateSchema(useFormSchema(isEdit));
    if (isEdit) {
      const fileConfig = await getFileConfig(data.id);
      id.value = fileConfig.id;
      formApi.setValues(fileConfig);
      formApi.setFieldValue('id', fileConfig.id);
    }
  }
}

async function onConfirm() {
  const { valid } = await formApi.validate();
  if (!valid) return;
  const values = await formApi.getValues();
  drawerApi.lock();
  (id.value
    ? updateFileConfigApi(values as FileApi.UpdateConfigModel)
    : addFileConfigApi(values as FileApi.AddConfigModel)
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
