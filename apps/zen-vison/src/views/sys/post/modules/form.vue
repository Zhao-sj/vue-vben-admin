<script setup lang="ts">
import type { PostApi } from '#/api';

import { useVbenDrawer } from '@vben/common-ui';

import { isEmpty } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import { addPostApi, getPostApi, updatePostApi } from '#/api';
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
    ? $t('page.actionTitle.edit', [$t('sys.post.title')])
    : $t('page.actionTitle.create', [$t('sys.post.title')]);
});

const { loading, runAsync: getPost } = useRequest(getPostApi, {
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
  wrapperClass: 'grid-cols-1',
});

const [Drawer, drawerApi] = useVbenDrawer({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (isOpen) {
    formApi.updateSchema(useFormSchema());
    const data = drawerApi.getData<PostApi.Post>();
    if (!isEmpty(data)) {
      const post = await getPost(data.id);
      id.value = post.id;
      formApi.setValues(post);
      formApi.setFieldValue('id', post.id);
    }
  }
}

async function onConfirm() {
  const { valid } = await formApi.validate();
  if (!valid) return;
  const values = await formApi.getValues();
  drawerApi.lock();
  (id.value
    ? updatePostApi(values as PostApi.UpdateModel)
    : addPostApi(values as PostApi.AddModel)
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
    class="lg:w-1/3 2xl:w-1/4"
    footer-class="gap-x-0"
  >
    <Form />
  </Drawer>
</template>
