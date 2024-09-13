<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { omit } from 'lodash-es';

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

const optFormRef = ref<InstanceType<typeof OptForm>>();
const formState = ref<Partial<DictApi.DataUpdateModel>>({});

const {
  data: dictType,
  loading: typeLoading,
  runAsync: getType,
} = useRequest(getDictTypeApi, requestConf);

const { loading: dictLoading, runAsync: getDict } = useRequest(
  getDictDataApi,
  requestConf,
);

const { loading, runAsync } = useRequest(updateDictDataApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

const formInstance = computed(() => optFormRef.value?.getFormInstance());

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    formState.value = {};
    return;
  }

  const { id, typeId } = modal.getData();
  if (id && typeId) {
    const [dictData] = await Promise.all([getDict(id), getType(typeId)]);
    const ignoreKeys = ['createTime'];
    const data = omit(dictData, ignoreKeys) as DictApi.DataUpdateModel;
    formState.value = data;
  }
}

function onConfirm() {
  formInstance.value?.validate(async (valid) => {
    if (valid) {
      await runAsync(formState.value as DictApi.DataUpdateModel);
      ElMessage.success($t('zen.common.successTip'));
      modal.close();
      emit('success');
    }
  });
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="dictLoading || typeLoading"
    :title="$t('zen.service.dict.editData')"
    class="w-11/12 lg:w-1/3 2xl:w-1/4"
    draggable
  >
    <OptForm ref="optFormRef" v-model="formState" :type="dictType?.type" />
  </Modal>
</template>
