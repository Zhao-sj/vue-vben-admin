<script lang="ts" setup>
import { useElementPlusDesignTokens } from '@vben/hooks';

import { ElConfigProvider } from 'element-plus';

import { elementLocale } from '#/locales';
import { createWebSocketClient } from '#/utils';

defineOptions({ name: 'App' });

useElementPlusDesignTokens();
createWebSocketClient();
</script>

<template>
  <ElConfigProvider :locale="elementLocale">
    <RouterView />
  </ElConfigProvider>
</template>
