<script setup lang="ts">
import type { UserApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { cloneDeep } from 'lodash-es';

import { addUserApi, getDeptSimpleListApi, getPostSimpleListApi } from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { encryptBySha256 } from '#/utils';

import OptForm from './opt-form.vue';

interface Emits {
  (e: 'success'): void;
}

const emit = defineEmits<Emits>();

const requestConf = {
  loadingDelay: 200,
  manual: true,
};

const optFormRef = useTemplateRef('optFormRef');

const {
  data: deptList,
  loading: deptLoading,
  runAsync: getDept,
} = useRequest(getDeptSimpleListApi, requestConf);

const {
  data: postList,
  loading: postLoading,
  runAsync: getPost,
} = useRequest(getPostSimpleListApi, requestConf);

const { loading, runAsync } = useRequest(addUserApi, requestConf);

const [Drawer, drawer] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    await Promise.all([getDept(), getPost()]);
  }
}

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  const state = cloneDeep(values as UserApi.AddModel);
  state.password = encryptBySha256(state.password);

  await runAsync(state);
  ElMessage.success($t('page.success'));
  drawer.close();
  emit('success');
}
</script>

<template>
  <Drawer
    :confirm-loading="loading"
    :loading="deptLoading || postLoading"
    :title="$t('page.actionTitle.create', [$t('sys.user.name')])"
    class="md:w-1/2 2xl:w-1/3"
    destroy-on-close
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" :dept-list :post-list />
  </Drawer>
</template>
