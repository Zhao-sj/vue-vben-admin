<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { getUserApi } from '#/api';
import { useRequest } from '#/hooks';

import UserDetail from './user-detail.vue';

interface Props {
  id: number;
}

const props = defineProps<Props>();

const { isMobile } = useIsMobile();
const baseVisible = ref(false);

const { data, loading, runAsync } = useRequest(getUserApi, {
  loadingDelay: 200,
  manual: true,
});

const visible = computed({
  get: () => baseVisible.value && !!data.value,
  set(visible: boolean) {
    baseVisible.value = visible;
  },
});

const [Modal, modalApi] = useVbenModal({ footer: false });

async function handleMobileClick() {
  await runAsync(props.id);
  modalApi.open();
}
</script>

<template>
  <ElPopover
    v-if="!isMobile"
    v-model:visible="visible"
    :width="500"
    placement="right"
    trigger="click"
  >
    <template #reference>
      <ElButton
        :loading
        class="underline"
        link
        type="primary"
        @click="runAsync(id)"
      >
        {{ id }}
      </ElButton>
    </template>

    <UserDetail :user="data" />
  </ElPopover>

  <div v-else>
    <ElButton
      :loading
      class="underline"
      link
      type="primary"
      @click="handleMobileClick"
    >
      {{ id }}
    </ElButton>

    <Modal>
      <UserDetail :user="data" />
    </Modal>
  </div>
</template>
