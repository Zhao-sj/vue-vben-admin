<script setup lang="ts">
import type { VueDatePickerProps } from '@vuepic/vue-datepicker';

import { computed } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { usePreferences } from '@vben/preferences';

/**
 * @see https://vue3datepicker.com/
 */
import VueDatePicker from '@vuepic/vue-datepicker';

import { $t } from '#/locales';

import '@vuepic/vue-datepicker/dist/main.css';
import './index.scss';

const { isDark, locale } = usePreferences();

const datepickerLocale = computed(() =>
  locale.value === 'zh-CN' ? 'zh' : 'en',
);

const defaultConf = computed<VueDatePickerProps>(() => ({
  yearFirst: true,
  weekStart: 0,
  dayNames: [
    $t('page.date.sunday'),
    $t('page.date.monday'),
    $t('page.date.tuesday'),
    $t('page.date.wednesday'),
    $t('page.date.thursday'),
    $t('page.date.friday'),
    $t('page.date.saturday'),
  ],
  placeholder: $t('page.date.select'),
  format: 'yyyy/MM/dd',
  autoApply: true,
  cancelText: $t('page.cancel'),
  selectText: $t('page.confirm'),
  teleport: true,
  enableTimePicker: false,
}));
</script>

<template>
  <VueDatePicker v-bind="defaultConf" :dark="isDark" :locale="datepickerLocale">
    <template #clear-icon="{ clear }">
      <div class="p-2">
        <IconifyIcon class="text-sm" icon="ep:circle-close" @click="clear" />
      </div>
    </template>

    <template
      v-for="item in Object.keys($slots)"
      :key="item"
      #[item]="slotData"
    >
      <slot :name="item" v-bind="slotData ? slotData : {}"></slot>
    </template>
  </VueDatePicker>
</template>
