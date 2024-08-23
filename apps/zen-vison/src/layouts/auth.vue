<script setup lang="ts">
import { AuthPageLayout } from '@vben/layouts';

import { $t } from '#/locales';
</script>

<template>
  <AuthPageLayout
    :page-description="$t('zen.core.pageDesc')"
    :page-title="$t('zen.core.pageTitle')"
  />
</template>
