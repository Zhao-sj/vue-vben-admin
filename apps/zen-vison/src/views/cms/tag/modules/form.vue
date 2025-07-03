<script setup lang="ts">
import type { TagApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { isEmpty } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import { addCmsTagApi, getCmsTagApi, updateCmsTagApi } from '#/api';
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
    ? $t('page.actionTitle.edit', [$t('cms.tag.title')])
    : $t('page.actionTitle.create', [$t('cms.tag.title')]);
});

const { loading, runAsync: getTag } = useRequest(getCmsTagApi, {
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
    formApi.updateSchema(useFormSchema());
    const data = drawerApi.getData<TagApi.Tag>();
    if (!isEmpty(data)) {
      const tag = await getTag(data.id);
      id.value = tag.id;
      formApi.setValues(tag);
      formApi.setFieldValue('id', tag.id);
    }
  }
}

async function onConfirm() {
  const { valid } = await formApi.validate();
  if (!valid) return;
  const values = await formApi.getValues();
  drawerApi.lock();
  (id.value
    ? updateCmsTagApi(values as TagApi.UpdateModel)
    : addCmsTagApi(values as TagApi.AddModel)
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
