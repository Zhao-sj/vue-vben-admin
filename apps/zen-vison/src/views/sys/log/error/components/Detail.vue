<script setup lang="ts">
import type { LogApi } from '#/api';

import { useVbenModal } from '@vben/common-ui';

import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { formatToDateTime } from '#/utils';
import { DeviceInfo } from '#/views/sys/log/components';

const dictStore = useDictStore();
const log = ref<LogApi.Error>();

const [Modal, modal] = useVbenModal({ onOpenChange });

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
    :title="$t('zen.service.log.common.detail')"
    class="w-11/12 2xl:w-3/5"
    draggable
  >
    <div class="flex flex-col gap-3">
      <ElDescriptions :title="$t('zen.service.log.common.basicInfo')" border>
        <ElDescriptionsItem
          :label="$t('zen.service.log.common.appName')"
          class-name="w-1/6"
          label-class-name="w-1/6"
        >
          {{ log?.appName }}
        </ElDescriptionsItem>

        <ElDescriptionsItem
          :label="$t('zen.service.log.common.code')"
          class-name="w-1/6"
          label-class-name="w-1/6"
        >
          {{ log?.id }}
        </ElDescriptionsItem>

        <ElDescriptionsItem
          :label="$t('zen.service.log.common.traceId')"
          :span="2"
          class-name="w-1/6"
          label-class-name="w-1/6"
        >
          {{ log?.traceId || '-' }}
        </ElDescriptionsItem>

        <ElDescriptionsItem
          :label="$t('zen.service.log.error.status')"
          class-name="w-1/6"
          label-class-name="w-1/6"
        >
          <ElTag :type="dictStore.getLogProcess(log?.processStatus!)?.color">
            {{ dictStore.getLogProcess(log?.processStatus!)?.label }}
          </ElTag>
        </ElDescriptionsItem>

        <ElDescriptionsItem
          :label="$t('zen.service.log.error.processUser')"
          class-name="w-1/6"
          label-class-name="w-1/6"
        >
          {{ log?.processUserId || '-' }}
        </ElDescriptionsItem>

        <ElDescriptionsItem
          :label="$t('zen.service.log.error.processTime')"
          class-name="w-1/6"
          label-class-name="w-1/6"
        >
          {{ log?.processTime ? formatToDateTime(log.processTime) : '-' }}
        </ElDescriptionsItem>
      </ElDescriptions>

      <ElDescriptions
        :column="2"
        :title="$t('zen.service.log.common.userInfo')"
        border
      >
        <ElDescriptionsItem
          :label="$t('zen.service.log.common.userId')"
          width="25%"
        >
          {{ log?.userId }}
        </ElDescriptionsItem>

        <ElDescriptionsItem
          :label="$t('zen.service.log.common.userType')"
          width="25%"
        >
          <ElTag :type="dictStore.getUserType(log?.userType!)?.color">
            {{ dictStore.getUserType(log?.userType!)?.label }}
          </ElTag>
        </ElDescriptionsItem>

        <ElDescriptionsItem
          :label="$t('zen.service.log.common.ip')"
          width="25%"
        >
          {{ log?.ip }}
        </ElDescriptionsItem>

        <ElDescriptionsItem
          :label="$t('zen.service.log.common.location')"
          width="25%"
        >
          {{ log?.location }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('zen.service.log.common.ua')">
          <DeviceInfo :ua="log?.ua!" />
        </ElDescriptionsItem>
      </ElDescriptions>

      <ElDescriptions
        :column="1"
        :title="$t('zen.service.log.common.requestInfo')"
      >
        <ElDescriptionsItem
          :label="$t('zen.service.log.common.requestMethod')"
          :span="8"
        >
          {{ log?.requestMethod }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('zen.service.log.common.requestUrl')">
          {{ log?.requestUrl }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('zen.service.log.common.requestParams')">
          {{ log?.requestParams }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('zen.service.log.error.exTime')">
          {{ formatToDateTime(log?.exTime) }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('zen.service.log.error.exName')">
          {{ log?.exName }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('zen.service.log.error.exMsg')">
          <div class="max-h-80 overflow-y-auto rounded-lg border p-2">
            {{ log?.exStackTrace }}
          </div>
        </ElDescriptionsItem>
      </ElDescriptions>
    </div>
  </Modal>
</template>
