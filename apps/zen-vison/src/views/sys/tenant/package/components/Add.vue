<script setup lang="ts">
import { cloneDeep } from 'lodash-es';

import { addTenantPackageApi, type MenuApi, type TenantApi } from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

import OptForm from './OptForm.vue';

interface Props {
  menus?: MenuApi.Simple[];
}

interface Emits {
  (e: 'success'): void;
}

withDefaults(defineProps<Props>(), {
  menus: () => [],
});
const emit = defineEmits<Emits>();

const modelValue = defineModel<boolean>('modelValue');

const defaultState = { status: 0 };
const optFormRef = ref<InstanceType<typeof OptForm>>();
const formState = ref<Partial<TenantApi.AddPackageModel>>(
  cloneDeep(defaultState),
);

const { loading, runAsync } = useRequest(addTenantPackageApi, {
  loadingDelay: 200,
  manual: true,
});

const formInstance = computed(() => optFormRef.value?.getFormInstance());
const treeInstance = computed(() => optFormRef.value?.getTreeInstance());

function handleClose() {
  formState.value = cloneDeep(defaultState);
}

function handleSubmit() {
  formInstance.value?.validate(async (valid) => {
    if (valid) {
      const keys = treeInstance.value!.getCheckedKeys() as number[];
      formState.value.menuIds = keys;

      await runAsync(formState.value as TenantApi.AddPackageModel);
      ElMessage.success($t('zen.common.successTip'));
      modelValue.value = false;
      emit('success');
    }
  });
}
</script>

<template>
  <ElDialog
    v-model="modelValue"
    :close-on-click-modal="false"
    :title="$t('zen.service.package.create')"
    class="!w-11/12 md:!w-1/2 2xl:!w-1/3"
    destroy-on-close
    draggable
    width="auto"
    @close="handleClose"
  >
    <OptForm ref="optFormRef" v-model="formState" :menus />

    <template #footer>
      <ElButton @click="modelValue = false">
        {{ $t('zen.common.cancel') }}
      </ElButton>
      <ElButton :loading type="primary" @click="handleSubmit">
        {{ $t('zen.common.confirm') }}
      </ElButton>
    </template>
  </ElDialog>
</template>
