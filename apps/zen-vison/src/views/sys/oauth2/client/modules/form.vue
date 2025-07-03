<script setup lang="ts">
import type { OAuth2Api } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { isEmpty } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import {
  addOAuth2ClientApi,
  getOAuth2ClientApi,
  updateOAuth2ClientApi,
} from '#/api';
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
    ? $t('page.actionTitle.edit', [$t('sys.oauth2.client.title')])
    : $t('page.actionTitle.create', [$t('sys.oauth2.client.title')]);
});

const { loading, runAsync: getOAuth2Client } = useRequest(getOAuth2ClientApi, {
  loadingDelay: 200,
  manual: true,
});

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  commonConfig: {
    componentProps: {
      clearable: true,
    },
  },
  schema: useFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 lg:grid-cols-2 gap-x-8',
});

const [Drawer, drawerApi] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    formApi.updateSchema(useFormSchema());
    const data = drawerApi.getData<OAuth2Api.Client>();
    if (!isEmpty(data)) {
      const client = await getOAuth2Client(data.id);
      id.value = client.id;
      formApi.setValues(client);
      formApi.setFieldValue('id', client.id);
    }
  }
}

async function onConfirm() {
  const { valid } = await formApi.validate();
  if (!valid) return;
  const values = await formApi.getValues();
  drawerApi.lock();
  (id.value
    ? updateOAuth2ClientApi(values as OAuth2Api.UpdateModel)
    : addOAuth2ClientApi(values as OAuth2Api.AddModel)
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
    class="lg:w-1/2 2xl:w-1/3"
    footer-class="gap-x-0"
  >
    <Form />
  </Drawer>
</template>
