<script setup lang="ts">
import type { FormState } from './typing';

import { useVbenModal } from '@vben/common-ui';

import { cloneDeep, isEqual, omit } from 'lodash-es';

import { addMenuApi, getMenuSimpleListApi, type MenuApi } from '#/api';
import { defaultMeta, MenuType } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

import OptForm from './OptForm.vue';

interface Emits {
  (e: 'success'): void;
}

const emit = defineEmits<Emits>();

const defaultState = {
  meta: defaultMeta,
  status: 0,
  type: MenuType.DIR,
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

const { loading, runAsync } = useRequest(addMenuApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

const formInstance = computed(() => optFormRef.value?.getFormInstance());

function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    getMenu();
    const { parentId } = modal.getData();
    if (parentId) {
      formState.value.parentId = parentId;
    }

    return;
  }

  formState.value = cloneDeep(defaultState);
}

function onConfirm() {
  formInstance.value?.validate(async (valid) => {
    if (valid) {
      let state = cloneDeep(formState.value) as MenuApi.AddModel;
      if (isEqual(state.meta, defaultMeta)) {
        state = omit(state, 'meta');
      }

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
    :cancel-text="$t('zen.common.cancel')"
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :confirm-text="$t('zen.common.confirm')"
    :loading="menuLoading"
    :title="$t('zen.service.menu.create')"
    class="w-11/12 md:w-1/2 2xl:w-1/3"
    draggable
  >
    <OptForm ref="optFormRef" v-model="formState" :menus />
  </Modal>
</template>
