<script setup lang="ts">
import type { LogApi } from '#/api';

import { JsonViewer, useVbenModal } from '@vben/common-ui';

import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { formatToDateTime } from '#/utils';
import { DeviceInfo } from '#/views/sys/log/components';

const dictStore = useDictStore();
const log = ref<LogApi.Error>();

const [Modal, modal] = useVbenModal({ onOpenChange });

const requestParams = computed(() => {
  if (!log.value) return;
  const obj: Record<string, any> = JSON.parse(log.value.requestParams);
  for (const key in obj) {
    let val;
    try {
      val = JSON.parse(obj[key]);
    } catch {
      val = obj[key];
    }
    obj[key] = val;
  }
  return obj;
});

function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const data = modal.getData<LogApi.Error>();
  if (data) {
    log.value = data;
  }
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :footer="false"
    :title="$t('sys.log.detail')"
    class="w-11/12 2xl:w-3/5"
    draggable
  >
    <div class="flex flex-col gap-3">
      <ElDescriptions :title="$t('sys.log.basicInfo')" border>
        <ElDescriptionsItem
          :label="$t('sys.log.appName')"
          class-name="w-1/6"
          label-class-name="w-1/6"
        >
          {{ log?.appName }}
        </ElDescriptionsItem>

        <ElDescriptionsItem
          :label="$t('sys.log.id')"
          class-name="w-1/6"
          label-class-name="w-1/6"
        >
          {{ log?.id }}
        </ElDescriptionsItem>

        <ElDescriptionsItem
          :label="$t('sys.log.traceId')"
          :span="2"
          class-name="w-1/6"
          label-class-name="w-1/6"
        >
          {{ log?.traceId || '-' }}
        </ElDescriptionsItem>

        <ElDescriptionsItem
          :label="$t('sys.log.error.status')"
          class-name="w-1/6"
          label-class-name="w-1/6"
        >
          <ElTag :type="dictStore.getLogProcess(log?.processStatus!)?.color">
            {{ dictStore.getLogProcess(log?.processStatus!)?.label }}
          </ElTag>
        </ElDescriptionsItem>

        <ElDescriptionsItem
          :label="$t('sys.log.error.processUser')"
          class-name="w-1/6"
          label-class-name="w-1/6"
        >
          {{ log?.processUserId || '-' }}
        </ElDescriptionsItem>

        <ElDescriptionsItem
          :label="$t('sys.log.error.processTime')"
          class-name="w-1/6"
          label-class-name="w-1/6"
        >
          {{ log?.processTime ? formatToDateTime(log.processTime) : '-' }}
        </ElDescriptionsItem>
      </ElDescriptions>

      <ElDescriptions :column="2" :title="$t('sys.log.userInfo')" border>
        <ElDescriptionsItem :label="$t('sys.log.userId')" width="25%">
          {{ log?.userId }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('sys.log.userType')" width="25%">
          <ElTag :type="dictStore.getUserType(log?.userType!)?.color">
            {{ dictStore.getUserType(log?.userType!)?.label }}
          </ElTag>
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('sys.log.ip')" width="25%">
          {{ log?.ip }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('sys.log.location')" width="25%">
          {{ log?.location }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('sys.log.ua')">
          <DeviceInfo :ua="log?.ua!" />
        </ElDescriptionsItem>
      </ElDescriptions>

      <ElDescriptions :column="1" :title="$t('sys.log.requestInfo')">
        <ElDescriptionsItem :label="$t('sys.log.requestMethod')" :span="8">
          {{ log?.requestMethod }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('sys.log.requestUrl')">
          {{ log?.requestUrl }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('sys.log.requestParams')">
          <JsonViewer :value="requestParams" preview-mode copyable boxed />
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('sys.log.error.exTime')">
          {{ formatToDateTime(log?.exTime) }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('sys.log.error.exName')">
          {{ log?.exName }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('sys.log.error.exMsg')">
          <div class="max-h-80 overflow-y-auto rounded-lg border p-2">
            {{ log?.exStackTrace }}
          </div>
        </ElDescriptionsItem>
      </ElDescriptions>
    </div>
  </Modal>
</template>
