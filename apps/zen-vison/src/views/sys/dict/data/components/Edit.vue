<script setup lang="ts">
import type { DictApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { cloneDeep, omit } from 'lodash-es';

import { getDictDataApi, getDictTypeApi, updateDictDataApi } from '#/api';
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

const optFormRef = useTemplateRef<InstanceType<typeof OptForm>>('optFormRef');

const {
  data: dictType,
  loading: typeLoading,
  runAsync: getType,
} = useRequest(getDictTypeApi, requestConf);

const {
  data,
  loading: dictLoading,
  runAsync: getDict,
} = useRequest(getDictDataApi, requestConf);

const { loading, runAsync } = useRequest(updateDictDataApi, requestConf);

const [Drawer, drawer] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id, typeId } = drawer.getData();
  if (id && typeId) {
    const [dictData] = await Promise.all([getDict(id), getType(typeId)]);
    setTimeout(() => {
      optFormRef.value?.formApi.setValues(dictData);
    }, 0);
  }
}

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  const state = omit(cloneDeep(values), ['type']);
  state.id = data.value.id;
  state.dictTypeId = dictType.value.id;

  await runAsync(state as DictApi.DataUpdateModel);
  ElMessage.success($t('page.success'));
  drawer.close();
  emit('success');
}
</script>

<template>
  <Drawer
    :confirm-loading="loading"
    :loading="dictLoading || typeLoading"
    :title="$t('page.actionTitle.edit', [$t('sys.dict.data.title')])"
    class="lg:w-1/3 2xl:w-1/4"
    destroy-on-close
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" :type="dictType?.type" />
  </Drawer>
</template>
