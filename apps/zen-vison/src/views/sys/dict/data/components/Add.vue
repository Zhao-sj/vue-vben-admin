<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { cloneDeep, omit } from 'lodash-es';

import { addDictDataApi, type DictApi, getDictTypeApi } from '#/api';
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

const { loading, runAsync } = useRequest(addDictDataApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    const { typeId } = modal.getData();
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
  ElMessage.success($t('zen.common.successTip'));
  modal.close();
  emit('success');
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="typeLoading"
    :title="$t('zen.service.dict.createData')"
    class="w-11/12 lg:w-1/3 2xl:w-1/4"
    draggable
  >
    <OptForm ref="optFormRef" :type="dictType?.type" />
  </Modal>
</template>
