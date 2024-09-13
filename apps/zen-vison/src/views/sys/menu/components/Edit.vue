<script setup lang="ts">
import type { FormState } from './typing';

import { useVbenModal } from '@vben/common-ui';

import { cloneDeep, isNull, omit } from 'lodash-es';

import {
  getMenuApi,
  getMenuSimpleListApi,
  type MenuApi,
  updateMenuApi,
} from '#/api';
import { defaultMeta } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

import OptForm from './OptForm.vue';

interface Emits {
  (e: 'success'): void;
}

const emit = defineEmits<Emits>();

const defaultState = {
  meta: defaultMeta,
} as FormState;

const requestConf = {
  loadingDelay: 200,
  manual: true,
};

const optFormRef = ref<InstanceType<typeof OptForm>>();
const formState = ref<FormState>(cloneDeep(defaultState));

const {
  data: menus,
  loading: menuLoading,
  runAsync: getMenu,
} = useRequest(getMenuSimpleListApi, requestConf);

const { loading: pckLoading, runAsync: getData } = useRequest(
  getMenuApi,
  requestConf,
);

const { loading, runAsync } = useRequest(updateMenuApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

const formInstance = computed(() => optFormRef.value?.getFormInstance());

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = modal.getData();
  if (id) {
    const [menu] = await Promise.all([getData(id), getMenu()]);
    const ignoreKeys = ['createTime'];
    if (isNull(menu.meta)) {
      menu.meta = cloneDeep(defaultMeta);
    }
    formState.value = omit(menu, ignoreKeys) as FormState;
  }
}

function onConfirm() {
  formInstance.value?.validate(async (valid) => {
    if (valid) {
      const state = cloneDeep(formState.value) as MenuApi.UpdateModel;

      await runAsync(state);
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
    :loading="menuLoading || pckLoading"
    :title="$t('zen.service.menu.edit')"
    class="w-11/12 md:w-1/2 2xl:w-1/3"
    draggable
  >
    <OptForm ref="optFormRef" v-model="formState" :menus edit />
  </Modal>
</template>
