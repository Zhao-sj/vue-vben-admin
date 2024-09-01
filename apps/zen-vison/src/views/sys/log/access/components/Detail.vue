<script setup lang="ts">
import type { LogApi } from '#/api';

import { useVbenModal } from '@vben/common-ui';

import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { formatToDateTime } from '#/utils';
import { DeviceInfo } from '#/views/sys/log/components';

const dictStore = useDictStore();
const log = ref<LogApi.Access>();

const [Modal, modal] = useVbenModal({ onOpenChange });

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
    :title="$t('zen.service.log.common.detail')"
    class="w-11/12 2xl:w-3/5"
    draggable
  >
    <div class="flex flex-col gap-3">
      <ElDescriptions
        :column="2"
        :title="$t('zen.service.log.common.basicInfo')"
        border
      >
        <ElDescriptionsItem
          :label="$t('zen.service.log.common.appName')"
          width="25%"
        >
          {{ log?.appName }}
        </ElDescriptionsItem>

        <ElDescriptionsItem
          :label="$t('zen.service.log.common.code')"
          width="25%"
        >
          {{ log?.id }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('zen.service.log.common.traceId')">
          {{ log?.traceId || '-' }}
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

        <ElDescriptionsItem :label="$t('zen.service.log.access.responseBody')">
          {{ log?.responseBody || '-' }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('zen.service.log.access.beginTime')">
          {{ formatToDateTime(log?.beginTime) }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('zen.service.log.access.endTime')">
          {{ formatToDateTime(log?.endTime) }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('zen.service.log.access.duration')">
          {{ log?.duration }}ms
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('zen.service.log.access.operateModule')">
          {{ log?.operateModule || '-' }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('zen.service.log.access.operateName')">
          {{ log?.operateName || '-' }}
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('zen.service.log.access.operateType')">
          <ElTag :type="dictStore.getOperaType(log?.operateType!)?.color">
            {{ dictStore.getOperaType(log?.operateType!)?.label }}
          </ElTag>
        </ElDescriptionsItem>

        <ElDescriptionsItem :label="$t('zen.service.log.access.resultMsg')">
          {{ log?.resultMsg || '-' }}
        </ElDescriptionsItem>
      </ElDescriptions>
    </div>
  </Modal>
</template>
