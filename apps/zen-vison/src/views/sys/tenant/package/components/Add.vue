<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { cloneDeep } from 'lodash-es';

import {
  addTenantPackageApi,
  getMenuSimpleListApi,
  type TenantApi,
} from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

import OptForm from './OptForm.vue';

interface Emits {
  (e: 'success'): void;
}

const emit = defineEmits<Emits>();

const defaultState = { status: 0 };
const requestConf = {
  loadingDelay: 200,
  manual: true,
};

const optFormRef = ref<InstanceType<typeof OptForm>>();
const formState = ref<Partial<TenantApi.AddPackageModel>>(
  cloneDeep(defaultState),
);

const {
  data: menus,
  loading: menuLoading,
  runAsync: getMenu,
} = useRequest(getMenuSimpleListApi, requestConf);

const { loading, runAsync } = useRequest(addTenantPackageApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

const formInstance = computed(() => optFormRef.value?.getFormInstance());
const treeInstance = computed(() => optFormRef.value?.getTreeInstance());

function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    getMenu();
    return;
  }

  formState.value = cloneDeep(defaultState);
}

function onConfirm() {
  formInstance.value?.validate(async (valid) => {
    if (valid) {
      const keys = treeInstance.value!.getCheckedKeys() as number[];
      formState.value.menuIds = keys;

      await runAsync(formState.value as TenantApi.AddPackageModel);
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
    :loading="menuLoading"
    :title="$t('zen.service.package.create')"
    class="w-11/12 md:w-1/2 2xl:w-1/3"
    draggable
  >
    <OptForm ref="optFormRef" v-model="formState" :menus />
  </Modal>
</template>
