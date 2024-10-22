<script setup lang="ts">
import type { UserApi } from '#/api';

import { useIsMobile } from '@vben/hooks';
import { Icon } from '@vben/icons';

import { DictSex } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

interface Props {
  user?: UserApi.User;
}

const props = defineProps<Props>();

const dictStore = useDictStore();
const { isMobile } = useIsMobile();
const { MALE, FEMALE } = DictSex;

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
      label: $t('zen.service.user.avatar'),
      value: avatar,
      slots: { default: 'avatar' },
    },
    { label: $t('zen.service.user.username'), value: username },
    { label: $t('zen.service.user.nickname'), value: nickname },
    {
      label: $t('zen.service.user.sex'),
      value: sex,
      slots: { default: 'sex' },
    },
    { label: $t('zen.service.user.deptName'), value: deptName || '-' },
    { label: $t('zen.service.user.mobile'), value: mobile || '-' },
    { label: $t('zen.service.user.email'), value: email || '-' },
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
          <Icon class="text-5xl" icon="lucide:user-round" />
        </ElAvatar>
      </template>

      <div
        v-else-if="item.slots?.default === 'sex'"
        class="flex items-center gap-1"
      >
        <Icon
          v-if="user?.sex === MALE || user?.sex === FEMALE"
          v-bind="createSex(user.sex)"
        />
        <span>{{ dictStore.getSex(user!.sex)?.label || '-' }}</span>
      </div>

      <template v-else>{{ item.value }}</template>
    </ElDescriptionsItem>
  </ElDescriptions>
</template>
