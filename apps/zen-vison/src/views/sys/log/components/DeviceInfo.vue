<script setup lang="ts">
import { UAParser } from 'ua-parser-js';

interface Props {
  ua: string;
}

const props = defineProps<Props>();

function getDeviceInfo() {
  if (!props.ua) {
    return '-';
  }

  const { browser, os } = UAParser(props.ua);

  const deviceType = [os.name, os.version].filter((item) => !!item).join(' ');
  const kernelInfo = [browser.name, browser.version]
    .filter((item) => !!item)
    .join(' ');

  const info = [deviceType, kernelInfo]
    .filter((item) => !!item)
    .map((item, i, arr) => (i === arr.length - 1 ? `[${item}]` : item))
    .join(' ');

  return info || props.ua;
}
</script>

<template>
  <ElTooltip :content="ua" :disabled="ua === getDeviceInfo()" :show-after="750">
    <span>{{ getDeviceInfo() }}</span>
  </ElTooltip>
</template>
