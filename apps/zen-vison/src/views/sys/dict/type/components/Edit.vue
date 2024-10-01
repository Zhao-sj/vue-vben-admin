<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { type DictApi, getDictTypeApi, updateDictTypeApi } from '#/api';
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
  data: dict,
  loading: dictLoading,
  runAsync: getDict,
} = useRequest(getDictTypeApi, requestConf);

const { loading, runAsync } = useRequest(updateDictTypeApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = modal.getData();
  if (id) {
    const dict = await getDict(id);
    setTimeout(() => {
      optFormRef.value?.formApi.setValues(dict);
    }, 0);
  }
}

async function onConfirm() {
  if (!optFormRef.value) return;
  const { valid } = await optFormRef.value.formApi.validate();
  if (!valid) return;

  const values = await optFormRef.value.formApi.getValues();
  await runAsync({ id: dict.value.id, ...values } as DictApi.TypeUpdateModel);
  ElMessage.success($t('zen.common.successTip'));
  modal.close();
  emit('success');
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="dictLoading"
    :title="$t('zen.service.dict.edit')"
    class="w-11/12 lg:w-1/3 2xl:w-1/4"
    draggable
  >
    <OptForm ref="optFormRef" edit />
  </Modal>
</template>
