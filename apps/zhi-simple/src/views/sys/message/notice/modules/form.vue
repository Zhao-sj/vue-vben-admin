<script setup lang="ts">
import type { NoticeApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { isEmpty } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import { addNoticeApi, getNoticeApi, updateNoticeApi } from '#/api';
import { Tinymce } from '#/components';
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
    ? $t('page.actionTitle.edit', [$t('sys.message.notice.name')])
    : $t('page.actionTitle.create', [$t('sys.message.notice.name')]);
});

const { loading, runAsync: getNotice } = useRequest(getNoticeApi, {
  loadingDelay: 200,
  manual: true,
});

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
  wrapperClass: 'grid-cols-1 lg:grid-cols-2 gap-x-4',
});

const [Drawer, drawerApi] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    formApi.updateSchema(useFormSchema());
    const data = drawerApi.getData<NoticeApi.Notice>();
    if (!isEmpty(data)) {
      const notice = await getNotice(data.id);
      id.value = notice.id;
      formApi.setValues(notice);
      formApi.setFieldValue('id', notice.id);
    }
  }
}

async function onConfirm() {
  const { valid } = await formApi.validate();
  if (!valid) return;
  const values = await formApi.getValues();
  drawerApi.lock();
  (id.value
    ? updateNoticeApi(values as NoticeApi.UpdateModel)
    : addNoticeApi(values as NoticeApi.AddModel)
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
    :loading
    :title="getDrawerTitle"
    class="w-full lg:w-1/2"
    footer-class="gap-x-0"
    :close-on-click-modal="false"
  >
    <Form>
      <template #content="slotProps">
        <Tinymce v-bind="slotProps" />
      </template>
    </Form>
  </Drawer>
</template>
