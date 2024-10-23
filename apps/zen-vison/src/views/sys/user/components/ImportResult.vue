<script setup lang="ts">
import type { UserApi } from '#/api';

import { useVbenModal } from '@vben/common-ui';

interface Emits {
  (e: 'confirm'): void;
}

const emit = defineEmits<Emits>();

const data = ref<UserApi.ImportResp>({
  createUserList: [],
  failureUsers: {},
  updateUserList: [],
});

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

const failList = computed(() =>
  Object.keys(data.value.failureUsers).map((item) => ({
    name: item,
    reason: data.value.failureUsers[item]!,
  })),
);

function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const { data: resultData } = modal.getData();
  if (resultData) {
    data.value = resultData;
  }
}

function onConfirm() {
  const { createUserList, updateUserList } = data.value;
  if (createUserList.length > 0 || updateUserList.length > 0) {
    emit('confirm');
  }
  modal.close();
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :title="$t('sys.user.upload.result')"
    draggable
  >
    <div class="flex flex-col gap-2">
      <div>
        <ElDescriptions :column="1" border>
          <ElDescriptionsItem
            :label="$t('sys.user.upload.createTotal')"
            width="50%"
          >
            {{ data.createUserList.length }}
          </ElDescriptionsItem>
        </ElDescriptions>
        <div
          v-if="data.createUserList.length > 0"
          class="flex max-h-20 flex-wrap gap-1 overflow-y-auto border border-t-0 p-2"
        >
          <ElTag v-for="(item, i) in data.createUserList" :key="i">
            {{ item }}
          </ElTag>
        </div>
      </div>

      <div>
        <ElDescriptions :column="1" border>
          <ElDescriptionsItem
            :label="$t('sys.user.upload.updateTotal')"
            width="50%"
          >
            {{ data.updateUserList.length }}
          </ElDescriptionsItem>
        </ElDescriptions>
        <div
          v-if="data.updateUserList.length > 0"
          class="flex max-h-20 flex-wrap gap-1 overflow-y-auto border border-t-0 p-2"
        >
          <ElTag
            v-for="(item, i) in data.updateUserList"
            :key="i"
            type="success"
          >
            {{ item }}
          </ElTag>
        </div>
      </div>

      <div>
        <ElDescriptions :column="1" border>
          <ElDescriptionsItem
            :label="$t('sys.user.upload.failTotal')"
            width="50%"
          >
            {{ failList.length }}
          </ElDescriptionsItem>
        </ElDescriptions>
        <div
          v-if="failList.length > 0"
          class="flex max-h-20 flex-wrap gap-1 overflow-y-auto border border-t-0 p-2"
        >
          <ElTag v-for="(item, i) in failList" :key="i" type="danger">
            {{ item.name }}: {{ item.reason }}
          </ElTag>
        </div>
      </div>
    </div>
  </Modal>
</template>
