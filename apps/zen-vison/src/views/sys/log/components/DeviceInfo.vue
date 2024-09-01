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
  const deviceType = `${os.name} ${os.version}`;
  const kernelInfo = `${browser.name} ${browser.version}`;

  return `${deviceType}[${kernelInfo}]`;
}
</script>

<template>
  <ElTooltip :content="ua" :show-after="750">
    <span>{{ getDeviceInfo() }}</span>
  </ElTooltip>
</template>
