<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { cloneDeep, omit } from 'lodash-es';

import {
  type DictApi,
  getDictDataApi,
  getDictTypeApi,
  updateDictDataApi,
} from '#/api';
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

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id, typeId } = modal.getData();
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
  modal.close();
  emit('success');
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="dictLoading || typeLoading"
    :title="$t('sys.dict.data.edit')"
    class="w-11/12 lg:w-1/3 2xl:w-1/4"
    draggable
  >
    <OptForm ref="optFormRef" :type="dictType?.type" />
  </Modal>
</template>
