<script setup lang="ts">
import type { LogApi } from '#/api';

import { JsonViewer, useVbenModal } from '@vben/common-ui';

import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { formatToDateTime } from '#/utils';
import { DeviceInfo } from '#/views/sys/log/components';

const dictStore = useDictStore();
const log = ref<LogApi.Access>();

const [Modal, modal] = useVbenModal({ onOpenChange });

const requestParams = computed(() => {
  if (!log.value) return;
  const obj: Record<string, any> = JSON.parse(log.value.requestParams);
  for (const key in obj) {
    obj[key] = JSON.parse(obj[key]);
  }
  return obj;
});

function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  const data = modal.getData<LogApi.Access>();
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
      <ElDescriptions :column="2" :title="$t('sys.log.basicInfo')" border>
        <ElDescriptionsItem :label="$t('sys.log.appName')" width="25%">
          {{ log?.appName }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('sys.log.id')" width="25%">
          {{ log?.id }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('sys.log.traceId')">
          {{ log?.traceId || '-' }}
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

        <ElDescriptionsItem :label="$t('sys.log.access.responseBody')">
          {{ log?.responseBody || '-' }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('sys.log.access.beginTime')">
          {{ formatToDateTime(log?.beginTime) }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('sys.log.access.endTime')">
          {{ formatToDateTime(log?.endTime) }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('sys.log.access.duration')">
          {{ log?.duration }}ms
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('sys.log.access.operateModule')">
          {{ log?.operateModule || '-' }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('sys.log.access.operateName')">
          {{ log?.operateName || '-' }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('sys.log.access.operateType')">
          <ElTag :type="dictStore.getOperaType(log?.operateType!)?.color">
            {{ dictStore.getOperaType(log?.operateType!)?.label }}
          </ElTag>
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('sys.log.access.resultMsg')">
          {{ log?.resultMsg || '-' }}
        </ElDescriptionsItem>
      </ElDescriptions>
    </div>
  </Modal>
</template>
