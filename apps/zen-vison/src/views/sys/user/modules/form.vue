<script setup lang="ts">
import type { UserApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { isEmpty } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import { addUserApi, getUserApi, updateUserApi } from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { encryptBySha256 } from '#/utils';

import { useFormSchema } from '../data';

interface Emits {
  (e: 'success'): void;
}

const emit = defineEmits<Emits>();

const requestConf = {
  loadingDelay: 200,
  manual: true,
};

const { loading, runAsync: getUser } = useRequest(getUserApi, requestConf);
const { runAsync: createUser } = useRequest(addUserApi, requestConf);
const { runAsync: updateUser } = useRequest(updateUserApi, requestConf);

const id = ref<number>();

const getDrawerTitle = computed(() => {
  return id.value
    ? $t('page.actionTitle.edit', $t('sys.user.name'))
    : $t('page.actionTitle.create', $t('sys.user.name'));
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
    const data = drawerApi.getData<UserApi.User>();
    if (!isEmpty(data)) {
      const user = await getUser(data.id);
      user.postIds = user.postIds || [];
      id.value = user.id;
      formApi.setValues(user);
      formApi.setFieldValue('id', user.id);
    }
  }
}

async function onConfirm() {
  const { valid } = await formApi.validate();
  if (!valid) return;
  const values = await formApi.getValues();
  if (values.password) {
    values.password = encryptBySha256(values.password);
  }
  drawerApi.lock();
  (id.value
    ? updateUser(values as UserApi.UpdateModel)
    : createUser(values as UserApi.AddModel)
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
    :loading="loading"
    :title="getDrawerTitle"
    class="md:w-1/2 2xl:w-1/3"
    footer-class="gap-x-0"
  >
    <Form />
  </Drawer>
</template>
