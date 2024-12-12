<script setup lang="ts">
import { IconifyIcon } from '@vben/icons';

import { uploadFileApi } from '#/api';

const url = defineModel<string>('modelValue');

function handleUpload() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.addEventListener('change', async (e) => {
    const files = (e.target as HTMLInputElement)?.files;
    if (!files) return;
    const file = files[0];
    if (file) {
      const uploadUrl = await uploadFileApi({ file });
      url.value = uploadUrl;
    }
  });
  input.click();
}
</script>

<template>
  <!-- TODO 后续实现图片预览和删除 -->
  <div
    :class="[{ 'border-dashed': !url }]"
    class="border-border hover:border-primary flex h-24 w-36 cursor-pointer items-center justify-center overflow-hidden rounded-md border transition"
    @click="handleUpload"
  >
    <img v-if="url" :src="url" class="w-full" />
    <IconifyIcon v-else class="text-xl" icon="ep:plus" />
  </div>
</template>
