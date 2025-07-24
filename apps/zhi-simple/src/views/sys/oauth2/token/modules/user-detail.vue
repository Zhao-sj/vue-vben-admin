<script setup lang="ts">
import type { UserApi } from '#/api';

import { useIsMobile } from '@vben/hooks';
import { IconifyIcon } from '@vben/icons';

import { DictSex, DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

interface Props {
  user?: UserApi.User;
}

const props = defineProps<Props>();

const { MALE, FEMALE } = DictSex;
const { isMobile } = useIsMobile();
const dictStore = useDictStore();

const dataList = computed(() => {
  if (!props.user) {
    return [];
  }

  const { avatar, username, nickname, sex, deptName, mobile, email } =
    props.user;

  const list = [
    {
      rowspan: 2,
      width: 140,
      align: 'center',
      label: $t('sys.user.avatar'),
      value: avatar,
      slots: { default: 'avatar' },
    },
    { label: $t('sys.user.username'), value: username },
    { label: $t('sys.user.nickname'), value: nickname },
    {
      label: $t('sys.user.sex'),
      value: sex,
      slots: { default: 'sex' },
    },
    { label: $t('sys.user.deptName'), value: deptName || '-' },
    { label: $t('sys.user.mobile'), value: mobile || '-' },
    { label: $t('sys.user.email'), value: email || '-' },
  ];

  return list;
});

function createSex(sex: number) {
  const isMale = sex === MALE;
  return {
    class: isMale ? 'text-blue-500' : 'text-pink-500',
    icon: isMale ? 'icon-park-outline:male' : 'icon-park-outline:female',
  };
}

function getSexDict(value?: number) {
  return dictStore.getDictData(DictTypeEnum.SEX, `${value}`);
}
</script>

<template>
  <ElDescriptions :column="isMobile ? 2 : 3" border direction="vertical">
    <ElDescriptionsItem
      v-for="item in dataList"
      :key="item.label"
      v-bind="item"
    >
      <template v-if="item.slots?.default === 'avatar'">
        <ElAvatar v-if="item.value" :size="100" :src="`${item.value}`" />
        <ElAvatar v-else :size="100">
          <IconifyIcon class="text-5xl" icon="lucide:user-round" />
        </ElAvatar>
      </template>

      <div
        v-else-if="item.slots?.default === 'sex'"
        class="flex items-center gap-1"
      >
        <IconifyIcon
          v-if="user?.sex === MALE || user?.sex === FEMALE"
          v-bind="createSex(user.sex)"
        />
        <span>{{ getSexDict(user!.sex)?.label || '-' }}</span>
      </div>

      <template v-else>{{ item.value }}</template>
    </ElDescriptionsItem>
  </ElDescriptions>
</template>
