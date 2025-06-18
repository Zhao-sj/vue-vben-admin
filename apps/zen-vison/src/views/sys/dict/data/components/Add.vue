<script setup lang="ts">
import type { DictApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { cloneDeep, omit } from 'lodash-es';

import { addDictDataApi, getDictTypeApi } from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

import OptForm from './OptForm.vue';

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
  data: dictType,
  loading: typeLoading,
  runAsync: getType,
} = useRequest(getDictTypeApi, requestConf);

const { loading, runAsync } = useRequest(addDictDataApi, requestConf);

const [Drawer, drawer] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    const { typeId } = drawer.getData();
    if (typeId) {
      await getType(typeId);
      setTimeout(() => {
        optFormRef.value?.formApi.setFieldValue('dictTypeId', typeId);
      }, 0);
    }
  }
}

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  const state = omit(cloneDeep(values), ['type']);

  await runAsync(state as DictApi.DataAddModel);
  ElMessage.success($t('page.success'));
  drawer.close();
  emit('success');
}
</script>

<template>
  <Drawer
    :confirm-loading="loading"
    :loading="typeLoading"
    :title="$t('page.actionTitle.create', [$t('sys.dict.data.title')])"
    class="lg:w-1/3 2xl:w-1/4"
    destroy-on-close
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" :type="dictType?.type" />
  </Drawer>
</template>
