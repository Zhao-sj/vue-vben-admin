<script setup lang="ts">
import { omit } from 'lodash-es';

import { type MenuApi, type TenantApi, updateTenantPackageApi } from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

import OptForm from './OptForm.vue';

interface Props {
  data?: TenantApi.Package;
  menus?: MenuApi.Simple[];
}

interface Emits {
  (e: 'success'): void;
}

const props = withDefaults(defineProps<Props>(), {
  data: undefined,
  menus: () => [],
});
const emit = defineEmits<Emits>();

const modelValue = defineModel<boolean>('modelValue');

const optFormRef = ref<InstanceType<typeof OptForm>>();
const formState = ref<Partial<TenantApi.AddPackageModel>>({});

const { loading, runAsync } = useRequest(updateTenantPackageApi, {
  loadingDelay: 200,
  manual: true,
});

const formInstance = computed(() => optFormRef.value?.getFormInstance());
const treeInstance = computed(() => optFormRef.value?.getTreeInstance());

function handleOpen() {
  const ignoreKeys = ['createTime'];
  const data = props.data;
  if (data) {
    formState.value = omit(data, ignoreKeys) as TenantApi.UpdateModel;
    treeInstance.value?.setCheckedKeys(data.menuIds);
  }
}

function handleSumit() {
  formInstance.value?.validate(async (valid) => {
    if (valid) {
      const keys = treeInstance.value!.getCheckedKeys() as number[];
      formState.value.menuIds = keys;

      await runAsync(formState.value as TenantApi.UpdatePackageModel);
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
    :title="$t('zen.service.package.edit')"
    class="!w-11/12 md:!w-1/2 2xl:!w-1/3"
    destroy-on-close
    draggable
    width="auto"
    @open="handleOpen"
  >
    <OptForm ref="optFormRef" v-model="formState" :menus />

    <template #footer>
      <ElButton @click="modelValue = false">
        {{ $t('zen.common.cancel') }}
      </ElButton>
      <ElButton :loading type="primary" @click="handleSumit">
        {{ $t('zen.common.confirm') }}
      </ElButton>
    </template>
  </ElDialog>
</template>
