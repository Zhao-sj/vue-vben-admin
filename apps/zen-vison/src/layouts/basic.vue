<script lang="ts" setup>
import type { Nullable } from '@vben/types';

import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  AuthenticationLoginExpiredModal,
  type LoginAndRegisterParams,
} from '@vben/common-ui';
import { LOGIN_PATH, VBEN_DOC_URL, VBEN_GITHUB_URL } from '@vben/constants';
import { useRefresh } from '@vben/hooks';
import { BookOpenText, CircleHelp, MdiGithub } from '@vben/icons';
import {
  BasicLayout,
  LockScreen,
  Notification,
  type NotificationItem,
  UserDropdown,
} from '@vben/layouts';
import { preferences } from '@vben/preferences';
import { resetAllStores, storeToRefs, useAccessStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

import { useDebounceFn } from '@vueuse/core';

import { type AuthApi, userLogoutApi } from '#/api';
import { Captcha } from '#/components';
import { $t } from '#/locales';
import { resetRoutes } from '#/router';
import { useAuthStore, useUserStore } from '#/store';
import { encryptBySha256 } from '#/utils';

const notifications = ref<NotificationItem[]>([
  {
    avatar: 'https://avatar.vercel.sh/vercel.svg?text=VB',
    date: '3小时前',
    isRead: true,
    message: '描述信息描述信息描述信息',
    title: '收到了 14 份新周报',
  },
  {
    avatar: 'https://avatar.vercel.sh/1',
    date: '刚刚',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '朱偏右 回复了你',
  },
  {
    avatar: 'https://avatar.vercel.sh/1',
    date: '2024-01-01',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '曲丽丽 评论了你',
  },
  {
    avatar: 'https://avatar.vercel.sh/satori',
    date: '1天前',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '代办提醒',
  },
]);

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
const accessStore = useAccessStore();
const { loginLoading } = storeToRefs(authStore);
const { refresh } = useRefresh();
const showCaptcha = ref(false);
let loginState: Nullable<AuthApi.LoginModel> = null;

const showDot = computed(() =>
  notifications.value.some((item) => !item.isRead),
);

const menus = computed(() => [
  {
    handler: () => {
      openWindow(VBEN_DOC_URL, {
        target: '_blank',
      });
    },
    icon: BookOpenText,
    text: $t('widgets.document'),
  },
  {
    handler: () => {
      openWindow(VBEN_GITHUB_URL, {
        target: '_blank',
      });
    },
    icon: MdiGithub,
    text: 'GitHub',
  },
  {
    handler: () => {
      openWindow(`${VBEN_GITHUB_URL}/issues`, {
        target: '_blank',
      });
    },
    icon: CircleHelp,
    text: $t('widgets.qa'),
  },
]);

const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});

const handleLogin = useDebounceFn((params: LoginAndRegisterParams) => {
  loginState = params;
  accessStore.setLoginExpired(false);
  showCaptcha.value = true;
});

function handleValidateSuccess(captcah: string) {
  if (!loginState) {
    return;
  }

  loginState.password = encryptBySha256(loginState.password);
  loginState.captcha = captcah;
  authStore.authLogin(loginState, refresh);
}

async function handleLogout() {
  try {
    await userLogoutApi();
  } finally {
    resetAllStores();
    resetRoutes();
    await router.replace(LOGIN_PATH);
  }
}

function handleCaptchaFail() {
  if (!accessStore.loginExpired) {
    accessStore.setLoginExpired(true);
  }
}

function handleNoticeClear() {
  notifications.value = [];
}

function handleMakeAll() {
  notifications.value.forEach((item) => (item.isRead = true));
}
</script>

<template>
  <BasicLayout @clear-preferences-and-logout="handleLogout">
    <template #user-dropdown>
      <UserDropdown
        :avatar
        :description="userStore.userInfo?.email"
        :menus
        :text="userStore.userInfo?.nickname"
        tag-text="Pro"
        @logout="handleLogout"
      />
    </template>
    <template #notification>
      <Notification
        :dot="showDot"
        :notifications="notifications"
        @clear="handleNoticeClear"
        @make-all="handleMakeAll"
      />
    </template>
    <template #extra>
      <div>
        <AuthenticationLoginExpiredModal
          v-model:open="accessStore.loginExpired"
          :avatar
          :loading="loginLoading"
          :password-placeholder="$t('zen.login.passwordPlaceholder')"
          :username-placeholder="$t('zen.login.usernamePlaceholder')"
          @submit="handleLogin"
        />

        <Captcha
          v-model="showCaptcha"
          :show-close="false"
          modal
          random
          @fail="handleCaptchaFail"
          @success="handleValidateSuccess"
        />
      </div>
    </template>
    <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
  </BasicLayout>
</template>
