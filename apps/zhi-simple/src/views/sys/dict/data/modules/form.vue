<script setup lang="ts">
import type { DictApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import {
  addDictDataApi,
  getDictDataApi,
  getDictTypeApi,
  updateDictDataApi,
} from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

interface Emits {
  (e: 'success'): void;
}

const emit = defineEmits<Emits>();

const id = ref<number>();

const getDrawerTitle = computed(() => {
  return id.value
    ? $t('page.actionTitle.edit', [$t('sys.dict.data.title')])
    : $t('page.actionTitle.create', [$t('sys.dict.data.title')]);
});

const requestConf = {
  loadingDelay: 200,
  manual: true,
};

const { loading: typeLoading, runAsync: getDictType } = useRequest(
  getDictTypeApi,
  requestConf,
);

const { loading, runAsync: getDictData } = useRequest(
  getDictDataApi,
  requestConf,
);

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      clearable: true,
    },
    labelClass: 'mr-4',
    labelWidth: 65,
  },
  schema: useFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

const [Drawer, drawerApi] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    formApi.updateSchema(useFormSchema());
    let { id: dictDataId, dictTypeId } = drawerApi.getData<DictApi.Data>();
    if (dictDataId) {
      const dictData = await getDictData(dictDataId);
      dictTypeId = dictData.dictTypeId;
      id.value = dictData.id;
      formApi.setValues(dictData);
      formApi.setFieldValue('id', dictData.id);
    }
    const dictType = await getDictType(dictTypeId);
    formApi.setFieldValue('type', dictType.type);
    formApi.setFieldValue('dictTypeId', dictTypeId);
  }
}

async function onConfirm() {
  const { valid } = await formApi.validate();
  if (!valid) return;
  const values = await formApi.getValues();
  drawerApi.lock();
  (id.value
    ? updateDictDataApi(values as DictApi.DataUpdateModel)
    : addDictDataApi(values as DictApi.DataAddModel)
  )
    .then(() => {
      emit('success');
      drawerApi.close();
    })
    .catch(() => {
      drawerApi.unlock();
    });
}
</script>

<template>
  <Drawer
    :loading="loading || typeLoading"
    :title="getDrawerTitle"
    class="lg:w-1/3 2xl:w-1/4"
    footer-class="gap-x-0"
  >
    <Form />
  </Drawer>
</template>
