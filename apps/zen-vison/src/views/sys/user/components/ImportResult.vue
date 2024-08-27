<script setup lang="ts">
import type { UserApi } from '#/api';

import { useNamespace } from '@vben/hooks';

interface Props {
  data: UserApi.ImportResp;
}

const props = defineProps<Props>();

const ns = useNamespace('import-result');

const failList = computed(() =>
  Object.keys(props.data.failureUsers).map((item) => ({
    name: item,
    reason: props.data.failureUsers[item]!,
  })),
);
</script>

<template>
  <div :class="[ns.b()]" class="flex flex-col gap-2">
    <div>
      <ElDescriptions :column="1" border>
        <ElDescriptionsItem label="创建成功数量" width="50%">
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
        <ElDescriptionsItem label="更新成功数量" width="50%">
          {{ data.updateUserList.length }}
        </ElDescriptionsItem>
      </ElDescriptions>
      <div
        v-if="data.updateUserList.length > 0"
        class="flex max-h-20 flex-wrap gap-1 overflow-y-auto border border-t-0 p-2"
      >
        <ElTag v-for="(item, i) in data.updateUserList" :key="i" type="success">
          {{ item }}
        </ElTag>
      </div>
    </div>

    <div>
      <ElDescriptions :column="1" border>
        <ElDescriptionsItem label="失败数量" width="50%">
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
</template>

<style lang="scss" scoped>
@import '@vben/styles/global';

:global(div:has(.#{$namespace}-import-result)) {
  width: 100%;
}
</style>
