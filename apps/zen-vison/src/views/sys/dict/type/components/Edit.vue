<script setup lang="ts">
import type { DictApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { getDictTypeApi, updateDictTypeApi } from '#/api';
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

const [Drawer, drawer] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { id } = drawer.getData();
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
  ElMessage.success($t('page.success'));
  drawer.close();
  emit('success');
}
</script>

<template>
  <Drawer
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="dictLoading"
    :title="$t('page.actionTitle.edit', [$t('sys.dict.type.title')])"
    class="lg:w-1/3 2xl:w-1/4"
    draggable
    footer-class="gap-x-0"
  >
    <OptForm ref="optFormRef" edit />
  </Drawer>
</template>
