<script setup lang="ts">
import type { UserProfileApi } from '#/api';

import { IconifyIcon } from '@vben/icons';
import { usePreferences } from '@vben/preferences';

import { uploadAvatarApi } from '#/api';
import { CropperUpload } from '#/components';
import { DictSex } from '#/enums';
import { $t } from '#/locales';
import { formatToDateTime } from '#/utils';

interface Props {
  data: UserProfileApi.UserInfo;
}

const props = defineProps<Props>();

const { isDark } = usePreferences();

const { MALE, FEMALE } = DictSex;

const poetry = computed(() => {
  const url = new URL('https://v2.jinrishici.com/one.svg');
  url.searchParams.set('font-size', '14');
  url.searchParams.set('color', isDark.value ? 'white' : 'gray');
  return url.toString();
});

const infoItems = computed(() => {
  const { data } = props;
  return [
    {
      label: $t('profile.basic.account'),
      value: data.username,
    },
    {
      label: $t('profile.basic.phone'),
      value: data.mobile || '-',
    },
    {
      label: $t('profile.basic.email'),
      value: data.email || '-',
    },
    {
      label: $t('profile.basic.dept'),
      value: data.dept?.name || '-',
    },
    {
      label: $t('profile.basic.position'),
      value: data.posts?.map((post) => post.name).join(', ') || '-',
    },
    {
      label: $t('profile.basic.role'),
      value: data.roles.map((role) => role.name).join(', ') || '-',
    },
    {
      label: $t('profile.basic.lastLogin'),
      value: formatToDateTime(data.loginDate),
    },
  ];
});

function createSex(sex: number) {
  const isMale = sex === MALE;
  return {
    class: isMale ? 'text-blue-500' : 'text-pink-500',
    icon: isMale ? 'icon-park-outline:male' : 'icon-park-outline:female',
  };
}
</script>

<template>
  <div>
    <div class="flex flex-col items-center">
      <CropperUpload
        :model-value="data.avatar"
        :width="128"
        :upload-api="uploadAvatarApi"
      />
      <div class="mt-2 flex items-center">
        <span class="text-xl font-bold">{{ data.nickname }}</span>
        <IconifyIcon
          v-if="data.sex === MALE || data.sex === FEMALE"
          v-bind="createSex(data.sex)"
        />
      </div>
      <img class="mt-2" :src="poetry" :alt="$t('profile.basic.todayPoetry')" />
    </div>

    <div class="basic-info mt-4 flex flex-col gap-3 px-8 text-sm">
      <div v-for="item in infoItems" :key="item.label" class="item-center flex">
        <label>{{ item.label }}</label>
        <span class="ml-2">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.basic-info {
  label {
    &::after {
      @apply ml-0.5;

      content: ':';
    }
  }
}
</style>
